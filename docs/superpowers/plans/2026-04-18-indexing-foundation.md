# Indexing Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `setIndex` / `resetIndex` (DataFrame), `at` / `iat` fast scalar accessors (Series + DataFrame), and `apply` with axis support (DataFrame) to node-pandas. Establish camelCase as the canonical naming convention with snake_case aliases for backward compatibility.

**Architecture:** All additions are **inline** in `src/series/series.js` and `src/dataframe/dataframe.js`, mirroring how the existing `LocIndexer` / `ILocIndexer` / `StringAccessor` classes already live inline. New indexer classes (`AtIndexer`, `IatIndexer` for both Series and DataFrame) follow the exact pattern of `LocIndexer`. `setIndex` / `resetIndex` / `apply` are method additions on the `NodeDataFrame` class. Aliases are one-line prototype assignments at end-of-file.

**Tech Stack:** Pure CommonJS Node.js, Jest 29.7 for tests. Zero runtime dependencies. Follow existing JSDoc conventions and `errors.js` typed error classes.

---

## Pre-flight Checklist (do once before starting Task 1)

- [ ] **Step 0a: Confirm baseline tests pass on master**

Run: `npx jest --listTests | head -5 && npx jest`
Expected: All tests PASS. If any FAIL on master, stop and surface the failure to the user before proceeding.

- [ ] **Step 0b: Confirm working directory is clean**

Run: `git status --short`
Expected: Empty output, or only ignored files. If unrelated changes exist, ask the user before continuing.

- [ ] **Step 0c: Read the design spec end-to-end**

Read: `docs/superpowers/specs/2026-04-18-indexing-foundation-design.md`
This plan is a 1:1 execution of that spec. If anything in the plan contradicts the spec, the spec wins — flag it and stop.

---

## File Map

Files modified or created in this plan:

| Path | Change | Why |
|---|---|---|
| `src/dataframe/dataframe.js` | Modify | Add `setIndex`, `resetIndex`, `apply`, `at`/`iat` getters, `AtIndexer`/`IatIndexer` classes |
| `src/series/series.js` | Modify | Add `at`/`iat` getters, `SeriesAtIndexer`/`SeriesIatIndexer` classes; append camelCase aliases |
| `tests/unit/setIndex.test.js` | Create | Unit tests for `df.setIndex` |
| `tests/unit/resetIndex.test.js` | Create | Unit tests for `df.resetIndex` |
| `tests/unit/at.test.js` | Create | Unit tests for `s.at` and `df.at` |
| `tests/unit/iat.test.js` | Create | Unit tests for `s.iat` and `df.iat` |
| `tests/unit/apply.test.js` | Create | Unit tests for `df.apply` with axis 0/1 |
| `tests/unit/aliases.test.js` | Create | Verify snake_case → camelCase aliases share function references |
| `README.md` | Modify | Add "Naming convention" section |
| `CHANGELOG.md` | Modify | Add v2.3.0 entry |
| `package.json` | Modify | Bump version to 2.3.0 |

**Existing patterns to follow (read before starting each task):**
- `LocIndexer` class — `src/series/series.js:508-600`
- `ILocIndexer` class — `src/series/series.js:615-720` (approx)
- `get loc()` / `get iloc()` getter pattern — `src/series/series.js:1113-1139`
- `Series` constructor — `src/series/series.js:988`
- Existing test layout — `tests/unit/tocsv.test.js`
- Error classes — `src/utils/errors.js` (`ValidationError`, `ColumnError`, `IndexError`, `OperationError`)
- Validation helpers — `src/utils/validation.js`

---

## Task 1: `setIndex` on DataFrame

**Files:**
- Modify: `src/dataframe/dataframe.js` (add method to `NodeDataFrame` class, before the closing `}` near line ~1640)
- Test: `tests/unit/setIndex.test.js` (create)

- [ ] **Step 1.1: Write the failing test file**

Create `tests/unit/setIndex.test.js` with the following content:

```javascript
/**
 * Unit tests for DataFrame.setIndex() method.
 * Validates: indexing-foundation spec Component 1.
 */

const DataFrame = require('../../src/dataframe/dataframe');

describe('DataFrame.setIndex()', () => {
  const buildDf = () => DataFrame(
    [[1, 'Alice', 25], [2, 'Bob', 30], [3, 'Carol', 35]],
    ['id', 'name', 'age']
  );

  describe('happy path', () => {
    test('promotes named column to index with drop:true (default)', () => {
      const df = buildDf();
      const out = df.setIndex('id');
      expect(out.index).toEqual([1, 2, 3]);
      expect(out.columns).toEqual(['name', 'age']);
      expect(out.data[0]).toEqual(['Alice', 25]);
      expect(out.data[2]).toEqual(['Carol', 35]);
    });

    test('keeps the column when drop:false', () => {
      const df = buildDf();
      const out = df.setIndex('id', { drop: false });
      expect(out.index).toEqual([1, 2, 3]);
      expect(out.columns).toEqual(['id', 'name', 'age']);
      expect(out.data[0]).toEqual([1, 'Alice', 25]);
    });

    test('returns a new DataFrame; original is unchanged (immutability)', () => {
      const df = buildDf();
      const originalIndex = [...df.index];
      const originalColumns = [...df.columns];
      df.setIndex('id');
      expect(df.index).toEqual(originalIndex);
      expect(df.columns).toEqual(originalColumns);
    });
  });

  describe('edge cases', () => {
    test('empty DataFrame returns empty DataFrame', () => {
      const df = DataFrame([], []);
      const out = df.setIndex('any');
      expect(out.rows).toBe(0);
    });

    test('allows duplicate values in the new index', () => {
      const df = DataFrame([[1, 'a'], [1, 'b'], [2, 'c']], ['k', 'v']);
      const out = df.setIndex('k');
      expect(out.index).toEqual([1, 1, 2]);
    });

    test('handles single-row DataFrame', () => {
      const df = DataFrame([[1, 'Alice']], ['id', 'name']);
      const out = df.setIndex('id');
      expect(out.index).toEqual([1]);
      expect(out.columns).toEqual(['name']);
    });
  });

  describe('errors', () => {
    test('throws ColumnError when column does not exist', () => {
      const df = buildDf();
      expect(() => df.setIndex('missing')).toThrow(/missing/);
    });

    test('throws ValidationError when columnName is not a string', () => {
      const df = buildDf();
      expect(() => df.setIndex(42)).toThrow();
      expect(() => df.setIndex(null)).toThrow();
      expect(() => df.setIndex(undefined)).toThrow();
    });
  });
});
```

- [ ] **Step 1.2: Run the test, confirm it fails**

Run: `npx jest tests/unit/setIndex.test.js -v`
Expected: All tests FAIL with `df.setIndex is not a function` (or similar).

- [ ] **Step 1.3: Implement `setIndex` on `NodeDataFrame`**

In `src/dataframe/dataframe.js`, add this method to the `NodeDataFrame` class (place it after the existing `getCell` method, before the `select` method — search for `select(columns)` to find a good anchor):

```javascript
  /**
   * Promotes a column to be the DataFrame's index.
   *
   * @param {string} columnName - The column name to promote.
   * @param {Object} [options] - Options object.
   * @param {boolean} [options.drop=true] - If true, the column is removed from columns; if false, it remains.
   * @returns {DataFrame} A new DataFrame with the chosen column as the index.
   *
   * @throws {ValidationError} If columnName is not a string.
   * @throws {ColumnError} If columnName is not in df.columns.
   *
   * @example
   * const df = DataFrame([[1, 'Alice'], [2, 'Bob']], ['id', 'name']);
   * const indexed = df.setIndex('id');
   * // indexed.index === [1, 2], indexed.columns === ['name']
   */
  setIndex(columnName, options = {}) {
    if (typeof columnName !== 'string') {
      throw new ValidationError('setIndex columnName must be a string', {
        operation: 'setIndex',
        value: columnName,
        expected: 'string',
        actual: typeof columnName
      });
    }

    const drop = options.drop !== false; // default true

    if (this.rows === 0) {
      return DataFrame([], drop ? this.columns.filter(c => c !== columnName) : this.columns);
    }

    const colIdx = this.columns.indexOf(columnName);
    if (colIdx === -1) {
      throw new ColumnError(`Column '${columnName}' does not exist`, {
        operation: 'setIndex',
        column: columnName,
        expected: `one of ${JSON.stringify(this.columns)}`,
        actual: columnName
      });
    }

    const newIndex = this.data.map(row => row[colIdx]);
    let newColumns;
    let newData;

    if (drop) {
      newColumns = this.columns.filter((_, i) => i !== colIdx);
      newData = this.data.map(row => row.filter((_, i) => i !== colIdx));
    } else {
      newColumns = [...this.columns];
      newData = this.data.map(row => [...row]);
    }

    const out = DataFrame(newData, newColumns);
    out.index = newIndex;
    return out;
  }
```

(Note: `DataFrame`, `ValidationError`, and `ColumnError` are already imported at the top of `dataframe.js`. If `DataFrame` the factory is not in scope inside the class, use `new NodeDataFrame(newData, newColumns)` instead — verify by searching the file.)

- [ ] **Step 1.4: Verify `DataFrame` factory is in scope inside the class**

Run: `grep -n "^const DataFrame\|^function DataFrame\|require.*dataframe" src/dataframe/dataframe.js | head -5`
Expected: `function DataFrame(dataList, columns = null) { ... }` defined at the bottom of the file.

If the factory is defined *below* the class (it is — at line ~1643), then inside the class methods, calling `DataFrame(...)` works because of function hoisting. If you see `is not defined` errors at test runtime, switch to `new NodeDataFrame(...)`.

- [ ] **Step 1.5: Run tests, confirm pass**

Run: `npx jest tests/unit/setIndex.test.js -v`
Expected: All 8 tests PASS.

- [ ] **Step 1.6: Run full test suite to catch regressions**

Run: `npx jest`
Expected: All tests PASS, no new failures.

- [ ] **Step 1.7: Commit**

```bash
git add src/dataframe/dataframe.js tests/unit/setIndex.test.js
git commit -m "$(cat <<'EOF'
feat(dataframe): DSA-5 #time 30m #comment Add setIndex method with drop option
EOF
)"
```

---

## Task 2: `resetIndex` on DataFrame

**Files:**
- Modify: `src/dataframe/dataframe.js` (add method right after `setIndex`)
- Test: `tests/unit/resetIndex.test.js` (create)

- [ ] **Step 2.1: Write the failing test file**

Create `tests/unit/resetIndex.test.js`:

```javascript
const DataFrame = require('../../src/dataframe/dataframe');

describe('DataFrame.resetIndex()', () => {
  const buildIndexedDf = () => {
    const df = DataFrame([[10, 'Alice'], [20, 'Bob']], ['age', 'name']);
    df.index = ['a', 'b'];
    return df;
  };

  describe('happy path', () => {
    test('default (drop:false) promotes index to a column named "index"', () => {
      const df = buildIndexedDf();
      const out = df.resetIndex();
      expect(out.columns).toEqual(['index', 'age', 'name']);
      expect(out.index).toEqual([0, 1]);
      expect(out.data[0]).toEqual(['a', 10, 'Alice']);
      expect(out.data[1]).toEqual(['b', 20, 'Bob']);
    });

    test('custom name is used when provided', () => {
      const df = buildIndexedDf();
      const out = df.resetIndex({ name: 'label' });
      expect(out.columns).toEqual(['label', 'age', 'name']);
    });

    test('drop:true discards the index without promoting', () => {
      const df = buildIndexedDf();
      const out = df.resetIndex({ drop: true });
      expect(out.columns).toEqual(['age', 'name']);
      expect(out.index).toEqual([0, 1]);
      expect(out.data[0]).toEqual([10, 'Alice']);
    });

    test('returns a new DataFrame; original is unchanged (immutability)', () => {
      const df = buildIndexedDf();
      const originalIndex = [...df.index];
      df.resetIndex();
      expect(df.index).toEqual(originalIndex);
    });
  });

  describe('edge cases', () => {
    test('empty DataFrame returns empty DataFrame', () => {
      const df = DataFrame([], []);
      const out = df.resetIndex();
      expect(out.rows).toBe(0);
    });
  });

  describe('errors', () => {
    test('throws ColumnError when name collides with existing column (drop:false)', () => {
      const df = buildIndexedDf();
      expect(() => df.resetIndex({ name: 'age' })).toThrow(/age/);
    });

    test('throws ValidationError when name is not a string', () => {
      const df = buildIndexedDf();
      expect(() => df.resetIndex({ name: 42 })).toThrow();
    });
  });
});
```

- [ ] **Step 2.2: Run test, confirm fail**

Run: `npx jest tests/unit/resetIndex.test.js -v`
Expected: All FAIL with `df.resetIndex is not a function`.

- [ ] **Step 2.3: Implement `resetIndex`**

In `src/dataframe/dataframe.js`, add this method right after `setIndex`:

```javascript
  /**
   * Demotes the current index back to a regular column, or discards it.
   *
   * @param {Object} [options] - Options object.
   * @param {boolean} [options.drop=false] - If true, discard the index entirely.
   * @param {string} [options.name='index'] - Name of the new column when promoting.
   * @returns {DataFrame} A new DataFrame.
   *
   * @throws {ValidationError} If name is not a string.
   * @throws {ColumnError} If name collides with an existing column (when drop:false).
   *
   * @example
   * const df = DataFrame([[10], [20]], ['age']);
   * df.index = ['a', 'b'];
   * df.resetIndex(); // columns: ['index', 'age']; data: [['a', 10], ['b', 20]]
   */
  resetIndex(options = {}) {
    const drop = options.drop === true; // default false
    const name = options.name === undefined ? 'index' : options.name;

    if (typeof name !== 'string') {
      throw new ValidationError('resetIndex name must be a string', {
        operation: 'resetIndex',
        value: name,
        expected: 'string',
        actual: typeof name
      });
    }

    if (this.rows === 0) {
      return DataFrame([], drop ? [...this.columns] : [name, ...this.columns]);
    }

    if (drop) {
      const newData = this.data.map(row => [...row]);
      const out = DataFrame(newData, [...this.columns]);
      // Default 0..n-1 index is set automatically by getIndicesColumns; no override.
      return out;
    }

    if (this.columns.indexOf(name) !== -1) {
      throw new ColumnError(`Column '${name}' already exists; choose a different name`, {
        operation: 'resetIndex',
        column: name,
        expected: 'a name not in df.columns',
        actual: name
      });
    }

    const newColumns = [name, ...this.columns];
    const newData = this.data.map((row, i) => [this.index[i], ...row]);
    return DataFrame(newData, newColumns);
  }
```

- [ ] **Step 2.4: Run tests, confirm pass**

Run: `npx jest tests/unit/resetIndex.test.js -v`
Expected: All 7 tests PASS.

- [ ] **Step 2.5: Run full suite for regressions**

Run: `npx jest`
Expected: All tests PASS.

- [ ] **Step 2.6: Commit**

```bash
git add src/dataframe/dataframe.js tests/unit/resetIndex.test.js
git commit -m "$(cat <<'EOF'
feat(dataframe): DSA-5 #time 30m #comment Add resetIndex method with drop and name options
EOF
)"
```

---

## Task 3: Series `at` indexer

**Files:**
- Modify: `src/series/series.js` (add `SeriesAtIndexer` class near `LocIndexer`; add `get at()` getter near `get loc()`)
- Test: `tests/unit/at.test.js` (create — Series portion only; DataFrame portion added in Task 4)

- [ ] **Step 3.1: Write the failing test file (Series portion)**

Create `tests/unit/at.test.js`:

```javascript
const Series = require('../../src/series/series');

describe('Series.at indexer', () => {
  const build = () => new Series([10, 20, 30], { index: ['a', 'b', 'c'] });

  describe('get', () => {
    test('returns scalar value at the given label', () => {
      const s = build();
      expect(s.at.get('a')).toBe(10);
      expect(s.at.get('b')).toBe(20);
      expect(s.at.get('c')).toBe(30);
    });

    test('throws IndexError when label is not found', () => {
      const s = build();
      expect(() => s.at.get('z')).toThrow();
    });

    test('throws ValidationError when label is an array', () => {
      const s = build();
      expect(() => s.at.get(['a', 'b'])).toThrow();
    });
  });

  describe('set', () => {
    test('mutates the value at the given label in place', () => {
      const s = build();
      s.at.set('b', 99);
      expect(s.at.get('b')).toBe(99);
      expect(s._data[1]).toBe(99);
    });

    test('returns the Series for chaining', () => {
      const s = build();
      const out = s.at.set('a', 0);
      expect(out).toBe(s);
    });

    test('throws IndexError when label is not found', () => {
      const s = build();
      expect(() => s.at.set('z', 1)).toThrow();
    });

    test('throws ValidationError when label is an array', () => {
      const s = build();
      expect(() => s.at.set(['a'], 1)).toThrow();
    });
  });
});
```

- [ ] **Step 3.2: Run test, confirm fail**

Run: `npx jest tests/unit/at.test.js -v`
Expected: All FAIL with `s.at is undefined` or similar.

- [ ] **Step 3.3: Implement `SeriesAtIndexer` and the `at` getter**

In `src/series/series.js`, add this class **immediately after** the `ILocIndexer` class definition (search for `class StringAccessor` to find the spot — `SeriesAtIndexer` goes right before it):

```javascript
/**
 * SeriesAtIndexer — fast scalar label-based accessor for Series.
 * Rejects array/slice arguments. Mirrors pandas `s.at[label]` semantics.
 *
 * @class SeriesAtIndexer
 */
class SeriesAtIndexer {
  constructor(series) {
    this._series = series;
  }

  /**
   * Get the scalar value at the given label.
   * @param {string|number} label - A single index label.
   * @returns {*} The value at the label.
   * @throws {ValidationError} If label is an array.
   * @throws {IndexError} If label is not in the index.
   */
  get(label) {
    if (Array.isArray(label)) {
      throw new ValidationError('at.get accepts only scalar labels, not arrays', {
        operation: 'Series.at.get',
        value: label,
        expected: 'scalar',
        actual: 'array'
      });
    }
    const idx = this._series._index.indexOf(label);
    if (idx === -1) {
      throw new IndexError(`Label '${label}' not found in index`, {
        operation: 'Series.at.get',
        value: label,
        expected: `one of ${JSON.stringify(this._series._index)}`,
        actual: label
      });
    }
    return this._series._data[idx];
  }

  /**
   * Set the scalar value at the given label in place.
   * @param {string|number} label - A single index label.
   * @param {*} value - The value to set.
   * @returns {Series} The Series (for chaining).
   * @throws {ValidationError} If label is an array.
   * @throws {IndexError} If label is not in the index.
   */
  set(label, value) {
    if (Array.isArray(label)) {
      throw new ValidationError('at.set accepts only scalar labels, not arrays', {
        operation: 'Series.at.set',
        value: label,
        expected: 'scalar',
        actual: 'array'
      });
    }
    const idx = this._series._index.indexOf(label);
    if (idx === -1) {
      throw new IndexError(`Label '${label}' not found in index`, {
        operation: 'Series.at.set',
        value: label,
        expected: `one of ${JSON.stringify(this._series._index)}`,
        actual: label
      });
    }
    this._series._data[idx] = value;
    this._series[idx] = value; // keep Array-extending storage in sync
    return this._series;
  }
}
```

Then add the getter inside the `Series` class. Search for `get loc()` (around line 1113) and add immediately after the existing `get iloc()` block:

```javascript
  /**
   * Fast scalar label-based accessor. Rejects array/slice arguments.
   * @returns {SeriesAtIndexer}
   */
  get at() {
    return new SeriesAtIndexer(this);
  }
```

Also confirm `IndexError` is imported at the top of `series.js`. Search for `errors` import — if `IndexError` is missing, add it to the destructured import.

- [ ] **Step 3.4: Verify `IndexError` import**

Run: `grep -n "require.*errors" src/series/series.js`
Expected: a destructured import like `const { ValidationError, ... } = require('../utils/errors')`.

If `IndexError` is not in that destructure, add it. Look at the existing import block around line 25-30 of `series.js`.

- [ ] **Step 3.5: Run test, confirm pass**

Run: `npx jest tests/unit/at.test.js -v`
Expected: All 7 tests PASS.

- [ ] **Step 3.6: Run full suite**

Run: `npx jest`
Expected: All tests PASS.

- [ ] **Step 3.7: Commit**

```bash
git add src/series/series.js tests/unit/at.test.js
git commit -m "$(cat <<'EOF'
feat(series): DSA-5 #time 30m #comment Add Series.at fast scalar label-based accessor
EOF
)"
```

---

## Task 4: DataFrame `at` indexer

**Files:**
- Modify: `src/dataframe/dataframe.js` (add `DataFrameAtIndexer` class above the `NodeDataFrame` class; add `get at()` inside the class)
- Modify: `tests/unit/at.test.js` (append a `describe('DataFrame.at indexer')` block)

- [ ] **Step 4.1: Add the failing DataFrame tests**

Append this block to `tests/unit/at.test.js`:

```javascript
const DataFrame = require('../../src/dataframe/dataframe');

describe('DataFrame.at indexer', () => {
  const build = () => {
    const df = DataFrame([[1, 'Alice', 25], [2, 'Bob', 30]], ['id', 'name', 'age']);
    df.index = ['x', 'y'];
    return df;
  };

  describe('get', () => {
    test('returns scalar at (rowLabel, colName)', () => {
      const df = build();
      expect(df.at.get('x', 'name')).toBe('Alice');
      expect(df.at.get('y', 'age')).toBe(30);
    });

    test('throws IndexError on missing rowLabel', () => {
      const df = build();
      expect(() => df.at.get('z', 'name')).toThrow();
    });

    test('throws ColumnError on missing colName', () => {
      const df = build();
      expect(() => df.at.get('x', 'missing')).toThrow();
    });

    test('throws ValidationError when arguments are non-scalar', () => {
      const df = build();
      expect(() => df.at.get(['x'], 'name')).toThrow();
      expect(() => df.at.get('x', ['name'])).toThrow();
    });
  });

  describe('set', () => {
    test('mutates the cell in place', () => {
      const df = build();
      df.at.set('x', 'name', 'Alicia');
      expect(df.at.get('x', 'name')).toBe('Alicia');
    });

    test('returns the DataFrame for chaining', () => {
      const df = build();
      const out = df.at.set('x', 'name', 'A');
      expect(out).toBe(df);
    });

    test('throws on missing row, missing col, or non-scalar args', () => {
      const df = build();
      expect(() => df.at.set('z', 'name', 1)).toThrow();
      expect(() => df.at.set('x', 'missing', 1)).toThrow();
      expect(() => df.at.set(['x'], 'name', 1)).toThrow();
    });
  });
});
```

- [ ] **Step 4.2: Run, confirm DataFrame portion fails**

Run: `npx jest tests/unit/at.test.js -v`
Expected: Series tests still PASS, new DataFrame tests FAIL with `df.at is undefined`.

- [ ] **Step 4.3: Implement `DataFrameAtIndexer`**

In `src/dataframe/dataframe.js`, add this class **above** `class NodeDataFrame extends Array` (search for `class NodeDataFrame` near line 55):

```javascript
/**
 * DataFrameAtIndexer — fast scalar label-based accessor for DataFrame cells.
 * Rejects array/slice arguments. Mirrors pandas `df.at[row, col]` semantics.
 *
 * @class DataFrameAtIndexer
 */
class DataFrameAtIndexer {
  constructor(df) {
    this._df = df;
  }

  _resolve(rowLabel, colName, op) {
    if (Array.isArray(rowLabel) || Array.isArray(colName)) {
      throw new ValidationError(`${op} accepts only scalar arguments`, {
        operation: op,
        value: { rowLabel, colName },
        expected: 'two scalars',
        actual: 'array'
      });
    }
    const rowIdx = this._df.index.indexOf(rowLabel);
    if (rowIdx === -1) {
      throw new IndexError(`Row label '${rowLabel}' not found in index`, {
        operation: op,
        value: rowLabel,
        expected: `one of ${JSON.stringify(this._df.index)}`,
        actual: rowLabel
      });
    }
    const colIdx = this._df.columns.indexOf(colName);
    if (colIdx === -1) {
      throw new ColumnError(`Column '${colName}' does not exist`, {
        operation: op,
        column: colName,
        expected: `one of ${JSON.stringify(this._df.columns)}`,
        actual: colName
      });
    }
    return { rowIdx, colIdx };
  }

  get(rowLabel, colName) {
    const { rowIdx, colIdx } = this._resolve(rowLabel, colName, 'DataFrame.at.get');
    return this._df.data[rowIdx][colIdx];
  }

  set(rowLabel, colName, value) {
    const { rowIdx, colIdx } = this._resolve(rowLabel, colName, 'DataFrame.at.set');
    this._df.data[rowIdx][colIdx] = value;
    return this._df;
  }
}
```

Then add the getter inside `NodeDataFrame` (place it after `getCell` for proximity to other accessors):

```javascript
  /**
   * Fast scalar label-based cell accessor.
   * @returns {DataFrameAtIndexer}
   */
  get at() {
    return new DataFrameAtIndexer(this);
  }
```

Confirm `IndexError`, `ColumnError`, and `ValidationError` are all imported at the top of `dataframe.js`. They should already be — verify with: `grep -n "require.*errors" src/dataframe/dataframe.js`.

- [ ] **Step 4.4: Run tests, confirm pass**

Run: `npx jest tests/unit/at.test.js -v`
Expected: All Series + DataFrame tests PASS.

- [ ] **Step 4.5: Run full suite**

Run: `npx jest`
Expected: All tests PASS.

- [ ] **Step 4.6: Commit**

```bash
git add src/dataframe/dataframe.js tests/unit/at.test.js
git commit -m "$(cat <<'EOF'
feat(dataframe): DSA-5 #time 30m #comment Add DataFrame.at fast scalar label-based cell accessor
EOF
)"
```

---

## Task 5: Series and DataFrame `iat` indexers

**Files:**
- Modify: `src/series/series.js` (add `SeriesIatIndexer` class; add `get iat()` getter)
- Modify: `src/dataframe/dataframe.js` (add `DataFrameIatIndexer`; add `get iat()`)
- Test: `tests/unit/iat.test.js` (create)

- [ ] **Step 5.1: Write the failing test file**

Create `tests/unit/iat.test.js`:

```javascript
const Series = require('../../src/series/series');
const DataFrame = require('../../src/dataframe/dataframe');

describe('Series.iat indexer', () => {
  const build = () => new Series([10, 20, 30], { index: ['a', 'b', 'c'] });

  test('get returns scalar at integer position', () => {
    const s = build();
    expect(s.iat.get(0)).toBe(10);
    expect(s.iat.get(2)).toBe(30);
  });

  test('set mutates cell in place and returns Series', () => {
    const s = build();
    const out = s.iat.set(1, 99);
    expect(s.iat.get(1)).toBe(99);
    expect(out).toBe(s);
  });

  test('throws IndexError when position is out of range', () => {
    const s = build();
    expect(() => s.iat.get(5)).toThrow();
    expect(() => s.iat.set(-1, 0)).toThrow();
  });

  test('throws ValidationError when position is non-integer or array', () => {
    const s = build();
    expect(() => s.iat.get([0])).toThrow();
    expect(() => s.iat.get(1.5)).toThrow();
    expect(() => s.iat.set('0', 1)).toThrow();
  });
});

describe('DataFrame.iat indexer', () => {
  const build = () => DataFrame([[1, 'Alice', 25], [2, 'Bob', 30]], ['id', 'name', 'age']);

  test('get returns scalar at (rowPos, colPos)', () => {
    const df = build();
    expect(df.iat.get(0, 1)).toBe('Alice');
    expect(df.iat.get(1, 2)).toBe(30);
  });

  test('set mutates cell and returns DataFrame', () => {
    const df = build();
    const out = df.iat.set(0, 1, 'Alicia');
    expect(df.iat.get(0, 1)).toBe('Alicia');
    expect(out).toBe(df);
  });

  test('throws IndexError on out-of-range row or col position', () => {
    const df = build();
    expect(() => df.iat.get(5, 0)).toThrow();
    expect(() => df.iat.get(0, 9)).toThrow();
  });

  test('throws ValidationError on non-integer or array args', () => {
    const df = build();
    expect(() => df.iat.get([0], 0)).toThrow();
    expect(() => df.iat.get(0, '1')).toThrow();
    expect(() => df.iat.get(0.5, 0)).toThrow();
  });
});
```

- [ ] **Step 5.2: Run, confirm fail**

Run: `npx jest tests/unit/iat.test.js -v`
Expected: All FAIL with `s.iat`/`df.iat` undefined.

- [ ] **Step 5.3: Implement `SeriesIatIndexer` in `series.js`**

Add immediately after `SeriesAtIndexer`:

```javascript
/**
 * SeriesIatIndexer — fast scalar position-based accessor for Series.
 * Rejects array/slice arguments and non-integer positions.
 */
class SeriesIatIndexer {
  constructor(series) {
    this._series = series;
  }

  _validatePos(position, op) {
    if (Array.isArray(position)) {
      throw new ValidationError(`${op} accepts only scalar integer positions, not arrays`, {
        operation: op, value: position, expected: 'integer', actual: 'array'
      });
    }
    if (!Number.isInteger(position)) {
      throw new ValidationError(`${op} requires an integer position`, {
        operation: op, value: position, expected: 'integer', actual: typeof position
      });
    }
    if (position < 0 || position >= this._series._data.length) {
      throw new IndexError(`Position ${position} out of range [0, ${this._series._data.length - 1}]`, {
        operation: op, value: position, expected: `0..${this._series._data.length - 1}`, actual: position
      });
    }
  }

  get(position) {
    this._validatePos(position, 'Series.iat.get');
    return this._series._data[position];
  }

  set(position, value) {
    this._validatePos(position, 'Series.iat.set');
    this._series._data[position] = value;
    this._series[position] = value;
    return this._series;
  }
}
```

Then add the getter inside `Series` (right after the `get at()` from Task 3):

```javascript
  /**
   * Fast scalar position-based accessor.
   * @returns {SeriesIatIndexer}
   */
  get iat() {
    return new SeriesIatIndexer(this);
  }
```

- [ ] **Step 5.4: Implement `DataFrameIatIndexer` in `dataframe.js`**

Add immediately after `DataFrameAtIndexer`:

```javascript
/**
 * DataFrameIatIndexer — fast scalar position-based cell accessor for DataFrame.
 */
class DataFrameIatIndexer {
  constructor(df) {
    this._df = df;
  }

  _resolve(rowPos, colPos, op) {
    if (Array.isArray(rowPos) || Array.isArray(colPos)) {
      throw new ValidationError(`${op} accepts only scalar integer positions`, {
        operation: op, value: { rowPos, colPos }, expected: 'two integers', actual: 'array'
      });
    }
    if (!Number.isInteger(rowPos) || !Number.isInteger(colPos)) {
      throw new ValidationError(`${op} requires integer positions`, {
        operation: op, value: { rowPos, colPos }, expected: 'two integers',
        actual: `${typeof rowPos}, ${typeof colPos}`
      });
    }
    if (rowPos < 0 || rowPos >= this._df.rows) {
      throw new IndexError(`Row position ${rowPos} out of range [0, ${this._df.rows - 1}]`, {
        operation: op, value: rowPos, expected: `0..${this._df.rows - 1}`, actual: rowPos
      });
    }
    if (colPos < 0 || colPos >= this._df.cols) {
      throw new IndexError(`Column position ${colPos} out of range [0, ${this._df.cols - 1}]`, {
        operation: op, value: colPos, expected: `0..${this._df.cols - 1}`, actual: colPos
      });
    }
  }

  get(rowPos, colPos) {
    this._resolve(rowPos, colPos, 'DataFrame.iat.get');
    return this._df.data[rowPos][colPos];
  }

  set(rowPos, colPos, value) {
    this._resolve(rowPos, colPos, 'DataFrame.iat.set');
    this._df.data[rowPos][colPos] = value;
    return this._df;
  }
}
```

Add the getter inside `NodeDataFrame` after `get at()`:

```javascript
  /**
   * Fast scalar position-based cell accessor.
   * @returns {DataFrameIatIndexer}
   */
  get iat() {
    return new DataFrameIatIndexer(this);
  }
```

- [ ] **Step 5.5: Run tests, confirm pass**

Run: `npx jest tests/unit/iat.test.js -v`
Expected: All tests PASS.

- [ ] **Step 5.6: Run full suite**

Run: `npx jest`
Expected: All tests PASS.

- [ ] **Step 5.7: Commit**

```bash
git add src/series/series.js src/dataframe/dataframe.js tests/unit/iat.test.js
git commit -m "$(cat <<'EOF'
feat: DSA-5 #time 30m #comment Add Series.iat and DataFrame.iat fast scalar position-based accessors
EOF
)"
```

---

## Task 6: DataFrame `apply` with axis

**Files:**
- Modify: `src/dataframe/dataframe.js` (add `apply` method to `NodeDataFrame`)
- Test: `tests/unit/apply.test.js` (create)

- [ ] **Step 6.1: Write the failing test file**

Create `tests/unit/apply.test.js`:

```javascript
const DataFrame = require('../../src/dataframe/dataframe');
const Series = require('../../src/series/series');

describe('DataFrame.apply()', () => {
  const buildDf = () => DataFrame(
    [[1, 10, 100], [2, 20, 200], [3, 30, 300]],
    ['a', 'b', 'c']
  );

  describe('axis 0 (column-wise, default)', () => {
    test('passes a Series per column to fn', () => {
      const df = buildDf();
      const seenNames = [];
      df.apply(col => {
        expect(col).toBeInstanceOf(Series);
        seenNames.push(col._name);
        return col.length;
      });
      expect(seenNames).toEqual(['a', 'b', 'c']);
    });

    test('returns Series of scalar results indexed by column name', () => {
      const df = buildDf();
      const out = df.apply(col => col._data.reduce((a, b) => a + b, 0));
      expect(out).toBeInstanceOf(Series);
      expect(out._index).toEqual(['a', 'b', 'c']);
      expect(out._data).toEqual([6, 60, 600]);
    });

    test('default axis is 0', () => {
      const df = buildDf();
      const out = df.apply(col => col._name);
      expect(out._data).toEqual(['a', 'b', 'c']);
    });
  });

  describe('axis 1 (row-wise)', () => {
    test('passes a Series per row to fn', () => {
      const df = buildDf();
      const out = df.apply(row => row._data.reduce((a, b) => a + b, 0), { axis: 1 });
      expect(out).toBeInstanceOf(Series);
      expect(out._data).toEqual([111, 222, 333]);
    });

    test('row Series index is the column names', () => {
      const df = buildDf();
      df.apply(row => {
        expect(row._index).toEqual(['a', 'b', 'c']);
        return 0;
      }, { axis: 1 });
    });
  });

  describe('return shape', () => {
    test('fn returning array yields a DataFrame', () => {
      const df = buildDf();
      const out = df.apply(col => [col._data[0], col._data[col._data.length - 1]]);
      expect(out.rows).toBe(2);
    });

    test('mixed scalar and array returns throws OperationError', () => {
      const df = buildDf();
      let i = 0;
      expect(() => {
        df.apply(() => (i++ === 0 ? 1 : [1, 2]));
      }).toThrow();
    });
  });

  describe('errors', () => {
    test('throws ValidationError if fn is not a function', () => {
      const df = buildDf();
      expect(() => df.apply(null)).toThrow();
      expect(() => df.apply(42)).toThrow();
    });

    test('throws ValidationError if axis is not 0 or 1', () => {
      const df = buildDf();
      expect(() => df.apply(x => x, { axis: 2 })).toThrow();
      expect(() => df.apply(x => x, { axis: 'row' })).toThrow();
    });

    test('errors thrown by fn propagate', () => {
      const df = buildDf();
      expect(() => df.apply(() => { throw new Error('boom'); })).toThrow('boom');
    });
  });

  describe('immutability', () => {
    test('does not mutate the original DataFrame', () => {
      const df = buildDf();
      const before = JSON.stringify(df.data);
      df.apply(col => col._data[0]);
      expect(JSON.stringify(df.data)).toBe(before);
    });
  });
});
```

- [ ] **Step 6.2: Run, confirm fail**

Run: `npx jest tests/unit/apply.test.js -v`
Expected: All FAIL with `df.apply is not a function`.

- [ ] **Step 6.3: Implement `apply`**

In `src/dataframe/dataframe.js`, add this method to `NodeDataFrame` (place after `resetIndex` from Task 2):

```javascript
  /**
   * Apply a function along an axis of the DataFrame.
   *
   * @param {Function} fn - The function to apply.
   * @param {Object} [options]
   * @param {0|1} [options.axis=0] - 0: pass each column as a Series; 1: pass each row as a Series.
   * @returns {Series|DataFrame} Series of scalars, or DataFrame if fn returns arrays/Series.
   *
   * @throws {ValidationError} If fn is not a function or axis is not 0/1.
   * @throws {OperationError} If fn returns mixed shapes (some scalar, some array).
   *
   * @example
   * const df = DataFrame([[1,2],[3,4]], ['a','b']);
   * df.apply(col => col._data.reduce((s, v) => s + v, 0));
   * // Series([4, 6], index=['a', 'b'])
   */
  apply(fn, options = {}) {
    if (typeof fn !== 'function') {
      throw new ValidationError('apply requires a function', {
        operation: 'apply', value: fn, expected: 'function', actual: typeof fn
      });
    }
    const axis = options.axis === undefined ? 0 : options.axis;
    if (axis !== 0 && axis !== 1) {
      throw new ValidationError('apply axis must be 0 or 1', {
        operation: 'apply', value: axis, expected: '0 or 1', actual: String(axis)
      });
    }

    const results = [];
    const resultIndex = [];

    if (axis === 0) {
      for (let c = 0; c < this.columns.length; c++) {
        const colName = this.columns[c];
        const colData = this.data.map(row => row[c]);
        const colSeries = new Series(colData, { index: [...this.index], name: colName });
        results.push(fn(colSeries));
        resultIndex.push(colName);
      }
    } else {
      for (let r = 0; r < this.rows; r++) {
        const rowData = [...this.data[r]];
        const rowSeries = new Series(rowData, { index: [...this.columns], name: this.index[r] });
        results.push(fn(rowSeries));
        resultIndex.push(this.index[r]);
      }
    }

    // Determine return shape
    const isArrayLike = v => Array.isArray(v) || (v && typeof v === 'object' && '_data' in v);
    const shapes = results.map(r => (isArrayLike(r) ? 'array' : 'scalar'));
    const allSame = shapes.every(s => s === shapes[0]);
    if (!allSame) {
      throw new OperationError('apply received mixed return shapes (some scalar, some array/Series)', {
        operation: 'apply', expected: 'uniform return shape', actual: shapes.join(',')
      });
    }

    if (shapes[0] === 'scalar') {
      return new Series(results, { index: resultIndex });
    }
    // Array/Series results -> build a DataFrame, one row per result
    const rowData = results.map(r => (Array.isArray(r) ? r : r._data));
    return DataFrame(rowData);
  }
```

Confirm `OperationError` is imported at the top of `dataframe.js`. If not, add it to the destructured `require('../utils/errors')`.

- [ ] **Step 6.4: Verify `OperationError` import**

Run: `grep -n "OperationError" src/dataframe/dataframe.js | head -3`
Expected: at least one match in the require line. If missing, add `OperationError` to the destructured import.

- [ ] **Step 6.5: Run tests, confirm pass**

Run: `npx jest tests/unit/apply.test.js -v`
Expected: All tests PASS.

- [ ] **Step 6.6: Run full suite**

Run: `npx jest`
Expected: All tests PASS.

- [ ] **Step 6.7: Commit**

```bash
git add src/dataframe/dataframe.js tests/unit/apply.test.js
git commit -m "$(cat <<'EOF'
feat(dataframe): DSA-5 #time 45m #comment Add DataFrame.apply with axis 0/1 support and Series-based callbacks
EOF
)"
```

---

## Task 7: camelCase aliases for snake_case methods

**Files:**
- Modify: `src/series/series.js` (append alias assignments after `module.exports = Series;`)
- Test: `tests/unit/aliases.test.js` (create)

- [ ] **Step 7.1: Identify which snake_case methods exist**

Run: `grep -n "^  \(sort_values\|sort_index\|value_counts\|drop_duplicates\)" src/series/series.js`
Expected: 4 method definitions on the `Series` class.

Also check DataFrame: `grep -n "^  \(sort_values\|sort_index\|value_counts\|drop_duplicates\)" src/dataframe/dataframe.js`
Note any matches — DataFrame may not have these methods, in which case its alias section is skipped.

- [ ] **Step 7.2: Write the failing alias test**

Create `tests/unit/aliases.test.js`:

```javascript
const Series = require('../../src/series/series');
const DataFrame = require('../../src/dataframe/dataframe');

describe('camelCase ↔ snake_case aliases', () => {
  describe('Series', () => {
    test('sortValues is the same function as sort_values', () => {
      expect(Series.prototype.sortValues).toBe(Series.prototype.sort_values);
    });

    test('sortIndex is the same function as sort_index', () => {
      expect(Series.prototype.sortIndex).toBe(Series.prototype.sort_index);
    });

    test('valueCounts is the same function as value_counts', () => {
      expect(Series.prototype.valueCounts).toBe(Series.prototype.value_counts);
    });

    test('dropDuplicates is the same function as drop_duplicates', () => {
      expect(Series.prototype.dropDuplicates).toBe(Series.prototype.drop_duplicates);
    });

    test('sortValues called via camelCase produces identical result to snake_case', () => {
      const s1 = new Series([3, 1, 2]);
      const s2 = new Series([3, 1, 2]);
      expect([...s1.sortValues()._data]).toEqual([...s2.sort_values()._data]);
    });
  });
});
```

- [ ] **Step 7.3: Run, confirm fail**

Run: `npx jest tests/unit/aliases.test.js -v`
Expected: All FAIL because `sortValues` is undefined.

- [ ] **Step 7.4: Add aliases at the end of `series.js`**

In `src/series/series.js`, find the line `module.exports = Series;` (line 2722). Insert these lines **before** that line:

```javascript
// camelCase aliases for snake_case methods (kept for backward compatibility).
// Canonical: camelCase. Aliases: snake_case. See README "Naming convention".
Series.prototype.sortValues = Series.prototype.sort_values;
Series.prototype.sortIndex = Series.prototype.sort_index;
Series.prototype.valueCounts = Series.prototype.value_counts;
Series.prototype.dropDuplicates = Series.prototype.drop_duplicates;
```

(If Step 7.1 found these methods on `NodeDataFrame` too, add equivalent lines at the bottom of `dataframe.js` before its `module.exports`.)

- [ ] **Step 7.5: Run tests, confirm pass**

Run: `npx jest tests/unit/aliases.test.js -v`
Expected: All 5 tests PASS.

- [ ] **Step 7.6: Run full suite**

Run: `npx jest`
Expected: All tests PASS.

- [ ] **Step 7.7: Commit**

```bash
git add src/series/series.js tests/unit/aliases.test.js
git commit -m "$(cat <<'EOF'
feat(series): DSA-5 #time 15m #comment Add camelCase aliases for sort_values, sort_index, value_counts, drop_duplicates
EOF
)"
```

---

## Task 8: Documentation, version bump, changelog

**Files:**
- Modify: `README.md` (add "Naming convention" section)
- Modify: `CHANGELOG.md` (add v2.3.0 entry)
- Modify: `package.json` (bump version to 2.3.0)

- [ ] **Step 8.1: Add "Naming convention" section to README**

Find the existing table of contents in `README.md` (search for `## Table of contents` or the first `## ` after the package header). After the table of contents but **before** the first `## Getting started` section, add this new section:

```markdown
## Naming convention

`node-pandas` uses **camelCase** as the canonical naming convention for all methods (e.g. `setIndex`, `sortValues`, `dropDuplicates`).

For backward compatibility, the four methods originally shipped with snake_case names continue to work:

| Canonical (camelCase) | Alias (snake_case) |
| --- | --- |
| `sortValues` | `sort_values` |
| `sortIndex` | `sort_index` |
| `valueCounts` | `value_counts` |
| `dropDuplicates` | `drop_duplicates` |

The aliases are literally the same function reference — there is no behavior or performance difference. New code should prefer the camelCase form.
```

- [ ] **Step 8.2: Add v2.3.0 changelog entry**

In `CHANGELOG.md`, insert this block immediately under the top `# Changelog` and intro lines, **before** the existing `## [2.2.0]` section:

```markdown
## [2.3.0] - 2026-04-18

### Added
- DataFrame.setIndex(columnName, { drop }) — promote a column to be the index
- DataFrame.resetIndex({ drop, name }) — demote the current index back to a column or discard it
- Series.at / DataFrame.at — fast scalar label-based cell accessors with .get / .set
- Series.iat / DataFrame.iat — fast scalar position-based cell accessors with .get / .set
- DataFrame.apply(fn, { axis }) — apply a function column-wise (axis 0) or row-wise (axis 1), passing real Series instances to the callback
- camelCase aliases for the existing snake_case methods (sortValues, sortIndex, valueCounts, dropDuplicates)

### Changed
- Established camelCase as the canonical naming convention; snake_case names retained as aliases. Documented in README under "Naming convention".

### Notes
- Zero breaking changes. All existing snake_case method calls continue to work via the new aliases.
```

- [ ] **Step 8.3: Bump version in `package.json`**

In `package.json`, change `"version": "2.2.0"` to `"version": "2.3.0"`.

- [ ] **Step 8.4: Run full suite one more time**

Run: `npx jest`
Expected: All tests PASS.

- [ ] **Step 8.5: Commit**

```bash
git add README.md CHANGELOG.md package.json
git commit -m "$(cat <<'EOF'
chore(release): DSA-5 #time 20m #comment Bump version to 2.3.0 and document indexing-foundation features
EOF
)"
```

---

## Task 9: Final verification and Kiro task-status sync

**Files:**
- Modify: `.kiro/specs/pandas-like-enhancements/tasks.md` (mark relevant tasks done — only if any of this work matches an existing Kiro task)
- Modify: `.kiro/time-log.md` (append rows for each commit; append-only, gitignored)

- [ ] **Step 9.1: Run the full test suite with coverage**

Run: `npm run test:coverage`
Expected: All tests PASS. Coverage stays ≥ 80% for `src/series` and `src/dataframe` (the only paths Jest tracks).

- [ ] **Step 9.2: Skim `.kiro/specs/pandas-like-enhancements/tasks.md`**

Read: `.kiro/specs/pandas-like-enhancements/tasks.md`

Look for any unstarted tasks (`- [ ]`) that this implementation completed. Likely candidates: nothing direct (the Kiro spec doesn't mention setIndex/resetIndex/at/iat/apply explicitly), but check anyway.

If a Kiro task matches: change its `- [ ]` to `- [x]` and add a one-line note pointing to the relevant commit(s).
If nothing matches: skip this step (do not invent matches).

- [ ] **Step 9.3: Update `.kiro/time-log.md`**

Append one row per commit made in Tasks 1-8 to `.kiro/time-log.md`. Format:

```
| 2026-04-18 | DSA-5 | <time>m | <short-hash> | <commit message body> |
```

Get short hashes via `git log --oneline -10`. The file is gitignored, so this is a local update — no commit needed.

- [ ] **Step 9.4: Final smoke test**

Run a quick interactive smoke test in node:

```bash
node -e "
const pd = require('./src/index.js');
const df = pd.DataFrame([[1, 'Alice', 25], [2, 'Bob', 30]], ['id', 'name', 'age']);
console.log('setIndex:', df.setIndex('id').index);
console.log('at.get:', df.setIndex('id').at.get(1, 'name'));
console.log('iat.get:', df.iat.get(0, 1));
console.log('apply axis 0:', df.apply(col => col._name)._data);
console.log('apply axis 1:', df.apply(row => row._data.length, { axis: 1 })._data);
console.log('alias:', new pd.Series([3,1,2]).sortValues()._data);
"
```

Expected output (approximately):
```
setIndex: [ 1, 2 ]
at.get: Alice
iat.get: Alice
apply axis 0: [ 'id', 'name', 'age' ]
apply axis 1: [ 3, 3 ]
alias: [ 1, 2, 3 ]
```

If anything misbehaves, debug and add a regression test before declaring done.

- [ ] **Step 9.5: Commit Kiro task-status sync (only if Step 9.2 produced changes)**

```bash
git add .kiro/specs/pandas-like-enhancements/tasks.md
git commit -m "$(cat <<'EOF'
chore(kiro): DSA-5 #time 5m #comment Mark Kiro tasks complete for indexing-foundation features
EOF
)"
```

If Step 9.2 found nothing to update, skip this step.

---

## Done

After Task 9: feature is implemented, tested, documented, version-bumped, and (if applicable) Kiro task status reflects completion. Ready to push and open a PR.

**Do NOT push from this plan.** Pushing is a separate deliberate action — let the user decide whether to push directly or via the `/cap` skill.

---

## Self-Review Notes (recorded after writing the plan)

**Spec coverage check:**
- Spec Component 1 (setIndex/resetIndex) → Tasks 1, 2 ✓
- Spec Component 2 (at/iat for Series + DataFrame) → Tasks 3, 4, 5 ✓
- Spec Component 3 (apply with axis) → Task 6 ✓
- Spec Component 4 (naming aliases) → Task 7 ✓
- Spec "Migration Impact" (README + CHANGELOG + version bump) → Task 8 ✓
- Spec "Testing" (one file per method) → Tasks 1-7 each create their corresponding test file ✓
- Spec "Open Questions" → none ✓

**Placeholder scan:** No "TBD"/"TODO"/"add appropriate error handling"/etc. Every code step shows the actual code. Every command shows the actual command and expected outcome.

**Type consistency:**
- Class names: `SeriesAtIndexer`, `SeriesIatIndexer`, `DataFrameAtIndexer`, `DataFrameIatIndexer` (consistent prefix-by-context)
- Method names on indexers: always `.get` and `.set` (matches existing `LocIndexer`/`ILocIndexer`)
- Method names added to DataFrame: `setIndex`, `resetIndex`, `apply`, `at` (getter), `iat` (getter)
- Aliases: `sortValues`/`sortIndex`/`valueCounts`/`dropDuplicates` — consistent across Step 7.4 alias assignments and Step 7.2 test expectations.
- Error class names match across all tasks: `ValidationError`, `IndexError`, `ColumnError`, `OperationError`.

**Open issues found by self-review:**
- Task 5's `SeriesIatIndexer.set` updates both `_series._data[position]` and `_series[position]` (the Array-extending storage). Task 3's `SeriesAtIndexer.set` does the same. Consistent.
- The existing `ILocIndexer.set` (in series.js) only updates `_series._data[position]` — see `series.js:694` neighborhood. There may already be a latent bug where the Array-extending side of the Series gets out of sync after `iloc.set`. Don't fix it in this plan (out of scope), but flag in the PR description.
