# Series API

> Part of the [node-pandas](https://github.com/hygull/node-pandas/blob/master/README.md) docs · See also: [DataFrame API](./dataframe.md)

A `Series` is a one-dimensional labelled array. It extends `Array`, so `s.length`, `s[0]` and `for...of` work natively, and every method that transforms data returns a **new** Series that keeps the original `index` and `name`.

`pd.Series(data, options)` and `new pd.Series(data, options)` are equivalent. Options: `index` (array of labels, defaults to `0..n-1`) and `name`.

**Contents**

- [Creating a Series](#creating-a-series)
- [Sorting Methods](#sorting-methods)
- [Missing Data Handling](#missing-data-handling)
- [Value Operations](#value-operations)
- [Comparison Operations](#comparison-operations)
- [Cumulative Operations](#cumulative-operations)
- [String Methods](#string-methods)
- [Indexing Methods](#indexing-methods)
- [Window Operations](#window-operations)

## Creating a Series

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 9, 2, 6, 7, -8, 4, -3, 0, 5])
console.log(s)
// Series(10) [
//    1, 9,  2, 6, 7,
//   -8, 4, -3, 0, 5
// ]

s.show
// ┌─────────┬───────┬───────┐
// │ (index) │ index │ value │
// ├─────────┼───────┼───────┤
// │    0    │   0   │   1   │
// │    1    │   1   │   9   │
// │    2    │   2   │   2   │
// │    3    │   3   │   6   │
// │    4    │   4   │   7   │
// │    5    │   5   │  -8   │
// │    6    │   6   │   4   │
// │    7    │   7   │  -3   │
// │    8    │   8   │   0   │
// │    9    │   9   │   5   │
// └─────────┴───────┴───────┘

console.log(s[0])           // 1  — first element
console.log(s.length)       // 10  — total number of elements
```

## Sorting Methods

### sort_values()

Sorts Series values in ascending or descending order.

```javascript
const pd = require("node-pandas")

const s = pd.Series([5, 2, 8, 1, 9], { name: 'numbers' })
console.log(s)              // Series(5) [ 5, 2, 8, 1, 9 ]

// Sort in ascending order (default)
const sorted_asc = s.sort_values()
console.log(sorted_asc)     // Series(5) [ 1, 2, 5, 8, 9 ]

// Sort in descending order
const sorted_desc = s.sort_values(false)
console.log(sorted_desc)    // Series(5) [ 9, 8, 5, 2, 1 ]
```

### sort_index()

Sorts Series by index labels in ascending or descending order.

```javascript
const pd = require("node-pandas")

const s = pd.Series([10, 20, 30], { index: ['c', 'a', 'b'], name: 'values' })
console.log(s)              // Series(3) [ 10, 20, 30 ]

// Sort by index in ascending order
const sorted_asc = s.sort_index()
console.log(sorted_asc)     // Series(3) [ 20, 30, 10 ]

// Sort by index in descending order
const sorted_desc = s.sort_index(false)
console.log(sorted_desc)    // Series(3) [ 10, 30, 20 ]
```

## Missing Data Handling

### fillna()

Fills missing values (null, undefined, NaN) with a specified value.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, null, 3, NaN, 5, undefined])
console.log(s)              // Series(6) [ 1, null, 3, NaN, 5, undefined ]

// Fill missing values with 0
const filled = s.fillna(0)
console.log(filled)         // Series(6) [ 1, 0, 3, NaN, 5, 0 ]
```

### dropna()

Removes all missing values (null, undefined, NaN) from the Series.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, null, 3, NaN, 5, undefined])
console.log(s)              // Series(6) [ 1, null, 3, NaN, 5, undefined ]

// Drop missing values
const cleaned = s.dropna()
console.log(cleaned)        // Series(4) [ 1, 3, NaN, 5 ]
```

### isna()

Returns a boolean Series indicating which values are missing (null, undefined, NaN).

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, null, 3, NaN, 5])
console.log(s)              // Series(5) [ 1, null, 3, NaN, 5 ]

// Check for missing values
const missing = s.isna()
console.log(missing)        // Series(5) [ false, true, false, false, false ]
```

### notna()

Returns a boolean Series indicating which values are not missing.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, null, 3, NaN, 5])
console.log(s)              // Series(5) [ 1, null, 3, NaN, 5 ]

// Check for non-missing values
const notMissing = s.notna()
console.log(notMissing)     // Series(5) [ true, false, true, true, true ]
```

## Value Operations

### unique()

Returns a new Series with unique values, preserving order of first appearance.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 2, 3, 1, 4, 3, 5])
console.log(s)
// Series(8) [
//   1, 2, 2, 3,
//   1, 4, 3, 5
// ]

// Get unique values
const uniqueValues = s.unique()
console.log(uniqueValues)   // Series(5) [ 1, 2, 3, 4, 5 ]
```

### value_counts()

Returns a Series containing counts of unique values, sorted by frequency in descending order.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['apple', 'banana', 'apple', 'orange', 'banana', 'apple'])
console.log(s)              // Series(6) [ 'apple', 'banana', 'apple', 'orange', 'banana', 'apple' ]

// Count occurrences of each value
const counts = s.value_counts()
counts.show
// ┌─────────┬──────────┬───────┐
// │ (index) │  index   │ value │
// ├─────────┼──────────┼───────┤
// │    0    │ 'apple'  │   3   │
// │    1    │ 'banana' │   2   │
// │    2    │ 'orange' │   1   │
// └─────────┴──────────┴───────┘
```

### duplicated()

Returns a boolean Series indicating duplicate values. The `keep` parameter controls which duplicates are marked:
- `'first'` (default): Mark duplicates as true except for the first occurrence
- `'last'`: Mark duplicates as true except for the last occurrence
- `false`: Mark all duplicates as true

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 2, 3, 1, 4])
console.log(s)              // Series(6) [ 1, 2, 2, 3, 1, 4 ]

// Mark duplicates (keep first occurrence)
const isDup = s.duplicated('first')
console.log(isDup)          // Series(6) [ false, false, true, false, true, false ]

// Mark duplicates (keep last occurrence)
const isDupLast = s.duplicated('last')
console.log(isDupLast)      // Series(6) [ true, true, false, false, false, false ]

// Mark all duplicates
const isDupAll = s.duplicated(false)
console.log(isDupAll)       // Series(6) [ true, true, true, false, true, false ]
```

### drop_duplicates()

Returns a new Series with duplicate values removed. The `keep` parameter controls which duplicates to keep:
- `'first'` (default): Keep the first occurrence
- `'last'`: Keep the last occurrence
- `false`: Remove all duplicates

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 2, 3, 1, 4])
console.log(s)              // Series(6) [ 1, 2, 2, 3, 1, 4 ]

// Keep first occurrence of duplicates
const uniqueFirst = s.drop_duplicates('first')
console.log(uniqueFirst)    // Series(4) [ 1, 2, 3, 4 ]

// Keep last occurrence of duplicates
const uniqueLast = s.drop_duplicates('last')
console.log(uniqueLast)     // Series(4) [ 2, 3, 1, 4 ]

// Remove all duplicates
const noDuplicates = s.drop_duplicates(false)
console.log(noDuplicates)   // Series(2) [ 3, 4 ]
```

## Comparison Operations

### eq()

Element-wise equality comparison. Compares Series values with a scalar or another Series.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5])
const result = s.eq(3)
console.log(result)         // Series(5) [ false, false, true, false, false ]

// Compare with another Series
const s1 = pd.Series([1, 2, 3])
const s2 = pd.Series([1, 0, 3])
const result2 = s1.eq(s2)
console.log(result2)        // Series(3) [ true, false, true ]
```

### ne()

Element-wise not-equal comparison.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5])
const result = s.ne(3)
console.log(result)         // Series(5) [ true, true, false, true, true ]
```

### gt()

Element-wise greater-than comparison.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5])
const result = s.gt(3)
console.log(result)         // Series(5) [ false, false, false, true, true ]
```

### lt()

Element-wise less-than comparison.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5])
const result = s.lt(3)
console.log(result)         // Series(5) [ true, true, false, false, false ]
```

### ge()

Element-wise greater-than-or-equal comparison.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5])
const result = s.ge(3)
console.log(result)         // Series(5) [ false, false, true, true, true ]
```

### le()

Element-wise less-than-or-equal comparison.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5])
const result = s.le(3)
console.log(result)         // Series(5) [ true, true, true, false, false ]
```

### between()

Check if values fall within a specified range. The `inclusive` parameter controls boundary inclusion:
- `'both'` (default): Include both boundaries
- `'neither'`: Exclude both boundaries
- `'left'`: Include left boundary only
- `'right'`: Include right boundary only

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5])
const result = s.between(2, 4)
console.log(result)         // Series(5) [ false, true, true, true, false ]

// Exclude boundaries
const result2 = s.between(2, 4, 'neither')
console.log(result2)        // Series(5) [ false, false, true, false, false ]
```

## Cumulative Operations

### cumsum()

Returns cumulative sum of values. Null values are preserved and skip accumulation.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5])
const result = s.cumsum()
console.log(result)         // Series(5) [ 1, 3, 6, 10, 15 ]

// With null values
const s2 = pd.Series([1, null, 3, 4, null, 6])
const result2 = s2.cumsum()
console.log(result2)        // Series(6) [ 1, null, 4, 8, null, 14 ]
```

### cumprod()

Returns cumulative product of values. Null values are preserved and skip accumulation.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5])
const result = s.cumprod()
console.log(result)         // Series(5) [ 1, 2, 6, 24, 120 ]

// With zeros
const s2 = pd.Series([1, 2, 0, 4, 5])
const result2 = s2.cumprod()
console.log(result2)        // Series(5) [ 1, 2, 0, 0, 0 ]
```

### cummax()

Returns cumulative maximum of values. Null values are preserved and skip accumulation.

```javascript
const pd = require("node-pandas")

const s = pd.Series([3, 1, 4, 1, 5, 9, 2])
const result = s.cummax()
console.log(result)
// Series(7) [
//   3, 3, 4, 4,
//   5, 9, 9
// ]

// With negative numbers
const s2 = pd.Series([-5, -2, -8, -1, -3])
const result2 = s2.cummax()
console.log(result2)        // Series(5) [ -5, -2, -2, -1, -1 ]
```

### cummin()

Returns cumulative minimum of values. Null values are preserved and skip accumulation.

```javascript
const pd = require("node-pandas")

const s = pd.Series([3, 1, 4, 1, 5, 9, 2])
const result = s.cummin()
console.log(result)
// Series(7) [
//   3, 1, 1, 1,
//   1, 1, 1
// ]

// With negative numbers
const s2 = pd.Series([-5, -2, -8, -1, -3])
const result2 = s2.cummin()
console.log(result2)        // Series(5) [ -5, -5, -8, -8, -8 ]
```

## String Methods

The `str` accessor provides string manipulation methods that work element-wise on Series values. All methods preserve null values.

### str.upper()

Convert strings to uppercase.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['hello', 'world', null])
const result = s.str.upper()
console.log(result)         // Series(3) [ 'HELLO', 'WORLD', null ]
```

### str.lower()

Convert strings to lowercase.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['HELLO', 'WORLD', null])
const result = s.str.lower()
console.log(result)         // Series(3) [ 'hello', 'world', null ]
```

### str.contains()

Check if strings contain a substring. Optional case-insensitive matching.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['hello', 'world', null, 'HELLO'])
const result = s.str.contains('ell')
console.log(result)         // Series(4) [ true, false, null, false ]

// Case-insensitive
const result2 = s.str.contains('ell', false)
console.log(result2)        // Series(4) [ true, false, null, true ]
```

### str.replace()

Replace occurrences of pattern with replacement string. Supports regex patterns.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['hello world', 'hello there', null])
const result = s.str.replace('hello', 'hi')
console.log(result)         // Series(3) [ 'hi world', 'hi there', null ]
```

### str.split()

Split strings by separator and return arrays.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['a,b,c', 'd,e,f', null])
const result = s.str.split(',')
console.log(result)         // Series(3) [ [ 'a', 'b', 'c' ], [ 'd', 'e', 'f' ], null ]
```

### str.strip()

Remove leading and trailing whitespace.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['  hello  ', '  world', null, 'test  '])
const result = s.str.strip()
console.log(result)         // Series(4) [ 'hello', 'world', null, 'test' ]
```

### str.startswith()

Check if strings start with a prefix.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['hello', 'world', null, 'help'])
const result = s.str.startswith('hel')
console.log(result)         // Series(4) [ true, false, null, true ]
```

### str.endswith()

Check if strings end with a suffix.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['hello', 'world', null, 'test'])
const result = s.str.endswith('ld')
console.log(result)         // Series(4) [ false, true, null, false ]
```

### str.len()

Get the length of each string.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['hello', 'world', null, 'test'])
const result = s.str.len()
console.log(result)         // Series(4) [ 5, 5, null, 4 ]
```

## Indexing Methods

The `loc` and `iloc` accessors provide label-based and position-based indexing for Series data.

### loc.get()

Access values by index labels. Supports single labels and arrays of labels.

```javascript
const pd = require("node-pandas")

const s = pd.Series([10, 20, 30, 40], { index: ['a', 'b', 'c', 'd'] })
console.log(s)              // Series(4) [ 10, 20, 30, 40 ]

// Get single value by label
const value = s.loc.get('b')
console.log(value)          // 20

// Get multiple values by labels
const values = s.loc.get(['a', 'c', 'd'])
console.log(values)         // Series(3) [ 10, 30, 40 ]
```

### iloc.get()

Access values by integer positions. Supports single positions and arrays of positions.

```javascript
const pd = require("node-pandas")

const s = pd.Series([10, 20, 30, 40], { index: ['a', 'b', 'c', 'd'] })
console.log(s)              // Series(4) [ 10, 20, 30, 40 ]

// Get single value by position
const value = s.iloc.get(1)
console.log(value)          // 20

// Get multiple values by positions
const values = s.iloc.get([0, 2, 3])
console.log(values)         // Series(3) [ 10, 30, 40 ]
```

### loc.set()

Set a single value by index label. Read it back with `loc.get()`.

```javascript
const pd = require("node-pandas")

const s = pd.Series([10, 20, 30, 40], { index: ['a', 'b', 'c', 'd'] })

// Set single value by label
s.loc.set('b', 99)
console.log(s.loc.get('b')) // 99
```

### iloc.set()

Set a single value by integer position. Read it back with `iloc.get()`.

```javascript
const pd = require("node-pandas")

const s = pd.Series([10, 20, 30, 40], { index: ['a', 'b', 'c', 'd'] })

// Set single value by position
s.iloc.set(1, 99)
console.log(s.iloc.get(1))  // 99
```

### at.get() / at.set()

Fast scalar label-based accessor. Like `loc`, but accepts only a single scalar label (no arrays or slices). Use this when you know you want exactly one cell.

```javascript
const pd = require("node-pandas")

const s = pd.Series([10, 20, 30], { index: ['a', 'b', 'c'] })

// Get single value by label
console.log(s.at.get('b'))  // 20

// Set single value by label (mutates in place, returns the Series for chaining)
s.at.set('b', 99)
console.log(s.at.get('b'))  // 99

// Errors:
//   s.at.get(['a', 'b'])  // throws ValidationError (arrays not allowed)
//   s.at.get('z')         // throws IndexError (label not in index)
```

### iat.get() / iat.set()

Fast scalar position-based accessor. Like `iloc`, but accepts only a single integer position. Use this when you know you want exactly one cell.

```javascript
const pd = require("node-pandas")

const s = pd.Series([10, 20, 30], { index: ['a', 'b', 'c'] })

// Get value by position
console.log(s.iat.get(1))   // 20

// Set value by position (mutates in place, returns the Series)
s.iat.set(1, 99)
console.log(s.iat.get(1))   // 99

// Errors:
//   s.iat.get([0])    // throws ValidationError (arrays not allowed)
//   s.iat.get(1.5)    // throws ValidationError (must be integer)
//   s.iat.get(99)     // throws IndexError (out of range)
```

`at` and `iat` also work on DataFrames as `df.at.get(rowLabel, colName)` and `df.iat.get(rowPos, colPos)`. See the [DataFrame API](./dataframe.md#cell-accessors-at-and-iat).

## Window Operations

Window operations allow you to perform calculations over sliding or expanding windows of data.

### rolling()

Create a rolling window for calculating statistics over a fixed window size.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

// Rolling mean with window size 3
const rollingMean = s.rolling(3).mean()
console.log(rollingMean)
// Series(10) [
//   null, null, 2, 3,
//   4,    5,    6, 7,
//   8,    9
// ]

// Rolling sum with window size 3
const rollingSum = s.rolling(3).sum()
console.log(rollingSum)
// Series(10) [
//   null, null, 6,  9,
//   12,   15,   18, 21,
//   24,   27
// ]

// Rolling min with window size 3
const rollingMin = s.rolling(3).min()
console.log(rollingMin)
// Series(10) [
//   null, null, 1, 2,
//   3,    4,    5, 6,
//   7,    8
// ]

// Rolling max with window size 3
const rollingMax = s.rolling(3).max()
console.log(rollingMax)
// Series(10) [
//   null, null, 3, 4,
//   5,    6,    7, 8,
//   9,    10
// ]

// Rolling standard deviation with window size 3
const rollingStd = s.rolling(3).std()
console.log(rollingStd)
// Series(10) [
//   null,
//   null,
//   0.816496580927726,
//   0.816496580927726,
//   0.816496580927726,
//   0.816496580927726,
//   0.816496580927726,
//   0.816496580927726,
//   0.816496580927726,
//   0.816496580927726
// ]
```

### expanding()

Create an expanding window that includes all values from the start up to the current position.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 3, 4, 5])

// Expanding mean
const expandingMean = s.expanding().mean()
console.log(expandingMean)  // Series(5) [ 1, 1.5, 2, 2.5, 3 ]

// Expanding sum
const expandingSum = s.expanding().sum()
console.log(expandingSum)   // Series(5) [ 1, 3, 6, 10, 15 ]

// Expanding min
const expandingMin = s.expanding().min()
console.log(expandingMin)   // Series(5) [ 1, 1, 1, 1, 1 ]

// Expanding max
const expandingMax = s.expanding().max()
console.log(expandingMax)   // Series(5) [ 1, 2, 3, 4, 5 ]

// Expanding standard deviation
const expandingStd = s.expanding().std()
console.log(expandingStd)
// Series(5) [
//   0,
//   0.5,
//   0.816496580927726,
//   1.118033988749895,
//   1.4142135623730951
// ]
```
