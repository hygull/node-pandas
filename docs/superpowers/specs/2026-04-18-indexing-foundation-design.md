# Indexing Foundation — Design

**Date:** 2026-04-18
**Status:** Draft (awaiting user review)
**Sub-project:** SP1, Phase 1 of the broader pandas-parity roadmap
**Author:** Claude (via Superpowers brainstorming skill, in dialogue with Rishikesh)

## Context

`node-pandas` v2.2.0 ships Series, DataFrame, GroupBy, basic stats, merge/concat, sort, fillna/dropna, value_counts, cumulative ops, str accessor, loc/iloc, and rolling/expanding windows. The library still lacks several pandas core primitives — most notably index manipulation (`set_index`/`reset_index`), fast scalar accessors (`at`/`iat`), and DataFrame-level `apply` with axis support.

This spec covers the **indexing foundation**: a small, focused first step that unblocks downstream work. Specifically, it's a prerequisite for:
- Reshape operations (`pivot`, `pivotTable`) — they need `setIndex` to produce meaningful results.
- Time-series work (`resample`) — needs a datetime-typed index, which requires `setIndex`.
- DataFrame-wide transformations — `apply` with axis lets users compose existing Series methods column-wise or row-wise.

A second spec (yet to be written) will follow with the rest of the reshape/quality-of-life features (`pivot`, `pivotTable`, `melt`, `crosstab`, `stack`, `unstack`, `shift`, `diff`, `pctChange`, `nlargest`, `nsmallest`, `rank`, `clip`, `where`, `mask`).

## Goals

1. Add `setIndex` and `resetIndex` to DataFrame with the standard pandas option set.
2. Add `at` and `iat` fast scalar accessors to both Series and DataFrame, mirroring the existing `loc`/`iloc` indexer pattern.
3. Add DataFrame `apply(fn, { axis })` that passes real Series instances to `fn`.
4. Establish **camelCase as the canonical naming convention** for the project, with snake_case kept as backward-compatible aliases for the four existing snake_case methods.

## Non-Goals (explicitly deferred)

- **MultiIndex / hierarchical indexing.** Requires redesigning index storage on Series/DataFrame; warrants its own dedicated spec.
- **`setIndex` accepting an array of values directly** (e.g. `setIndex([1,2,3])`). Defer to a follow-up; v1 only accepts a column name.
- **`apply` with `result_type` inference.** Pandas has elaborate logic for inferring whether the result should be a Series, DataFrame, or scalar. v1 uses a single explicit rule (see Apply section).
- **Renaming existing camelCase methods** (`groupBy`, `readCsv`, `toCsv`, `dateRange`). They already match the new convention; no change needed.

## Naming Convention

**Decision:** camelCase is canonical. snake_case remains as an alias for the four existing snake_case methods.

**Background.** The codebase currently mixes three conventions: snake_case (`sort_values`, `sort_index`, `value_counts`, `drop_duplicates`), camelCase (`groupBy`, `readCsv`, `toCsv`, `dateRange`), and all-lowercase (`fillna`, `dropna`, `isna`, `notna`, `loc`, `iloc`, `cumsum`, `cumprod`, `cummax`, `cummin`, `eq`, `ne`, `gt`, `lt`, `ge`, `le`, `between`). The all-lowercase ones are short enough that they read naturally in either convention and don't need renaming.

**Rule.**
- All new methods: camelCase only.
- The four snake_case methods (`sort_values`, `sort_index`, `value_counts`, `drop_duplicates`) get camelCase canonical names (`sortValues`, `sortIndex`, `valueCounts`, `dropDuplicates`); the snake_case names continue to work as aliases.
- README gets a "Naming convention" note documenting canonical vs alias.

**Implementation.**
```js
Series.prototype.sortValues = Series.prototype.sort_values;
// ...etc, repeated for sortIndex / valueCounts / dropDuplicates
```
No deprecation warnings in v2.x. A future v3 spec may decide to drop the snake_case aliases.

## Component 1: `setIndex` / `resetIndex`

### `df.setIndex(columnName, options)`

Promotes one of the DataFrame's columns to be the index. Returns a **new** DataFrame (immutable; the original is unchanged).

**Signature:**
```js
df.setIndex(columnName, { drop = true } = {})
```

**Parameters:**
- `columnName` (string, required) — name of the column to promote.
- `options.drop` (boolean, default `true`) — if `false`, the column also remains as a regular column in addition to being the index.

**Returns:** new `DataFrame`.

**Behavior:**
- New `_index` = the chosen column's values, in row order.
- New `columns` = old columns minus the promoted column (if `drop: true`) or unchanged (if `drop: false`).
- New `_data` = old rows with the index column removed (if `drop: true`) or unchanged (if `drop: false`).
- Duplicate values in the new index are **allowed**; logged via the existing logger as `INFO`.
- Empty DataFrame: returns a new empty DataFrame (no-op).

**Errors:**
- `ColumnError` if `columnName` is not in `df.columns`.
- `ValidationError` if `columnName` is not a string.

### `df.resetIndex(options)`

Demotes the current index back to a regular column, or discards it. Returns a new DataFrame.

**Signature:**
```js
df.resetIndex({ drop = false, name = 'index' } = {})
```

**Parameters:**
- `options.drop` (boolean, default `false`) — if `true`, discard the index entirely; the new index is a default range (`0..n-1`).
- `options.name` (string, default `'index'`) — name of the new column when promoting (ignored if `drop: true`).

**Returns:** new `DataFrame`.

**Behavior:**
- If `drop: false`: new column named `name` (default `'index'`) is prepended to `columns`, containing the old index values. New index becomes `0..n-1`.
- If `drop: true`: old index is discarded; new index is `0..n-1`. Columns and data unchanged.
- Empty DataFrame: returns a new empty DataFrame.

**Errors:**
- `ColumnError` if `name` collides with an existing column name (and `drop: false`).
- `ValidationError` if `name` is not a string.

## Component 2: `at` / `iat`

Fast scalar accessors. Mirror the existing `loc` / `iloc` pattern (`s.loc.get(label)`, etc.) so users have one consistent mental model for indexers.

**Why a separate accessor instead of overloading `loc`/`iloc`?** `at`/`iat` enforce single-cell access — they reject arrays, slices, and ranges. This makes both intent and implementation faster and safer. Pandas does this for the same reason.

### Series

```js
s.at.get(label)              // scalar value at label
s.at.set(label, value)       // mutate cell at label, returns the Series
s.iat.get(position)          // scalar value at integer position
s.iat.set(position, value)   // mutate cell at position, returns the Series
```

**Errors:**
- `ValidationError` if `label`/`position` is not a scalar (e.g. given an array or slice).
- `IndexError` if `label` not in `_index` (for `at`) or `position` out of range (for `iat`).

### DataFrame

```js
df.at.get(rowLabel, colName)
df.at.set(rowLabel, colName, value)
df.iat.get(rowPos, colPos)
df.iat.set(rowPos, colPos, value)
```

**Errors:**
- `ValidationError` if any argument is non-scalar.
- `IndexError` if `rowLabel`/`rowPos` not found.
- `ColumnError` if `colName` not found / `colPos` out of range.

### Implementation note

Two new classes — `AtIndexer` and `IatIndexer` — defined inline in `dataframe.js` and `series.js` respectively, mirroring how `LocIndexer` and `IlocIndexer` already live inline. Accessed via getter properties (`get at()`, `get iat()`) so they're constructed lazily on first access (matching the existing `loc`/`iloc` pattern).

### Mutation semantics

`set` mutates the underlying DataFrame/Series in place. This matches the existing `loc.set`/`iloc.set` behavior. Documented explicitly so users don't expect a returned copy.

## Component 3: `apply` with axis (DataFrame)

```js
df.apply(fn, { axis = 0 } = {})
```

**Parameters:**
- `fn` (function, required) — applied once per column (axis 0) or once per row (axis 1).
- `options.axis` (`0` or `1`, default `0`).

**Behavior — axis 0 (column-wise):**
- For each column `col`, construct `new Series(df[col], { index: df.index, name: col })`.
- Call `fn(columnSeries)`.
- Collect results into the return value.

**Behavior — axis 1 (row-wise):**
- For each row at position `i`, construct `new Series(df._data[i], { index: df.columns, name: df.index[i] })`.
- Call `fn(rowSeries)`.
- Collect results.

**Return type rules:**
- If `fn` returns a scalar (string, number, boolean, null, undefined): return a `Series` of those scalars. Indexed by column names (axis 0) or row labels (axis 1).
- If `fn` returns a `Series` or array: return a `DataFrame` whose rows/columns are the returned Series/arrays.
- Mixed return types across calls: throw `OperationError` (better to fail loudly than guess).

**Errors:**
- `ValidationError` if `fn` is not a function or `axis` is not `0`/`1`.
- Errors thrown by `fn` propagate unchanged (no swallowing).

## Component 4: Naming Alias Layer

Already covered in the Naming Convention section. The implementation is a one-line alias per method, added at the end of `series.js` after the class definition:

```js
Series.prototype.sortValues = Series.prototype.sort_values;
Series.prototype.sortIndex = Series.prototype.sort_index;
Series.prototype.valueCounts = Series.prototype.value_counts;
Series.prototype.dropDuplicates = Series.prototype.drop_duplicates;
```

(If any of these methods exist on DataFrame too, mirror the aliases there.)

## Implementation Notes — Existing State

Quick reference for implementers:
- `DataFrame` extends `Array`. Internal storage uses `this._data` (2D row array, non-enumerable) accessed via `data` getter/setter, `this.index` (array of row labels), `this.columns` (array of column names), `this.rows`, `this.cols`. Each column is also exposed as a Series via `this.setDataForColumns()`.
- `Series` extends `Array`. Internal storage uses `this._data`, `this._index`, `this._name`.
- The existing `LocIndexer` / `IlocIndexer` pattern (in `series.js`) is the model to follow for `AtIndexer` / `IatIndexer`. Look there first.
- All factory functions return `new ClassName(...)` rather than relying on `Array.prototype.map`/`filter` which would return plain arrays.

## File Layout

All additions are inline in existing files. No new modules.
- `src/dataframe/dataframe.js` — add `setIndex`, `resetIndex`, `apply`, `at` / `iat` getters, `AtIndexer` / `IatIndexer` classes.
- `src/series/series.js` — add `at` / `iat` getters, `AtIndexer` / `IatIndexer` classes for Series; add the four camelCase aliases at the end.

`series.js` (currently 2723 lines) and `dataframe.js` (currently 1659 lines) will grow by an estimated ~600 lines combined. If `series.js` crosses ~3500 lines as a result, that's a signal to do an extraction pass — but as a separate spec, not as part of this work.

## Error Handling

All errors use the existing classes from `src/utils/errors.js`:
- `ValidationError` for argument-shape problems.
- `ColumnError` for missing/duplicate column names.
- `IndexError` for out-of-range row positions or labels.
- `OperationError` for `apply` mixed-return-type cases.

Each error includes the standard context object: `{ operation, value, expected, actual }` (and `column` where relevant).

## Testing

One test file per method, mirroring `tests/unit/tocsv.test.js`:
- `tests/unit/setIndex.test.js`
- `tests/unit/resetIndex.test.js`
- `tests/unit/at.test.js`
- `tests/unit/iat.test.js`
- `tests/unit/apply.test.js`
- `tests/unit/aliases.test.js` — verifies snake_case aliases call through to camelCase canonical (and that they're literally the same function reference, to catch divergence).

Each file covers:
- **Happy path** — the documented behavior on typical input.
- **Edge cases** — empty DataFrame, single row, single column, all-null column, duplicate index values where allowed.
- **Error paths** — every documented error class, with assertion on the error's `context` field.
- **Immutability** — for non-mutating methods (`setIndex`, `resetIndex`, `apply`), verify the original DataFrame is unchanged.
- **Mutation** — for `at.set`/`iat.set`, verify the change is visible on the original.

Test data uses the existing helpers in `tests/utils/testDataGenerator.js` and assertions from `tests/utils/testAssertions.js`.

## Migration Impact

- **Zero breaking changes.** All four existing snake_case methods continue to work via aliases. New methods are purely additive.
- **README** gets a new section: "Naming convention" with a one-line note that snake_case names are aliases.
- **CHANGELOG** entry: "v2.3.0 — Add setIndex/resetIndex, at/iat indexers, DataFrame apply with axis. Establish camelCase as canonical naming, snake_case retained as aliases."

## Estimated Effort

Approximately 3-5 days end-to-end:
- Day 1: `setIndex` + `resetIndex` + tests.
- Day 2: `at` / `iat` for Series and DataFrame + tests.
- Day 3: `apply` with axis + tests.
- Day 4: Aliases + README docs + CHANGELOG + smoke-test full suite.
- Day 5 (buffer): Bug-fixing, JSDoc polish, code review iteration.

## Open Questions (for user review)

None — all design decisions were explicitly settled in the brainstorming dialogue. If on review you find an unstated assumption, flag it and we'll revise this doc.
