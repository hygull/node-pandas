/**
 * @fileoverview Series class for one-dimensional labeled data structures.
 * Extends JavaScript's native Array class to provide pandas-like Series functionality
 * with support for statistical operations, transformations, and data manipulation.
 * 
 * Validates: Requirements 1.1, 1.6, 6.1, 6.4, 7.1, 7.2, 7.3, 7.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8
 */

const {
  isNull,
  isNumeric,
  detectType,
  inferArrayType,
  toNumeric
} = require('../utils/typeDetection');

const {
  validateNotNull,
  validateArray,
  validateFunction,
  validateNumber
} = require('../utils/validation');

const {
  DataFrameError,
  ValidationError,
  TypeError: TypeErrorClass,
  OperationError
} = require('../utils/errors');

const { getLogger } = require('../utils/logger');

const logger = getLogger();

/**
 * Series class - A one-dimensional labeled array with pandas-like functionality.
 * Extends JavaScript's native Array class to provide array-like behavior while
 * adding statistical operations, transformations, and data manipulation methods.
 * 
 * @class Series
 * @extends Array
 * 
 * @example
 * // Create a Series from an array
 * const series = new Series([1, 2, 3, 4, 5]);
 * 
 * @example
 * // Create a Series with custom index
 * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
 * 
 * @example
 * // Access elements
 * console.log(series[0]); // 10
 * console.log(series.get('a')); // 10
 * 
 * @example
 * // Perform statistical operations
 * console.log(series.mean()); // 20
 * console.log(series.sum()); // 60
 * console.log(series.std()); // standard deviation
 */
class Series extends Array {
  /**
   * Creates a new Series instance.
   * 
   * @param {Array} data - The data for the Series. Can be any array of values.
   * @param {Object} [options={}] - Configuration options for the Series
   * @param {Array<string|number>} [options.index] - Custom index labels for elements.
   *        If not provided, numeric indices (0, 1, 2, ...) are used.
   * @param {string} [options.name] - Optional name for the Series
   * 
   * @throws {ValidationError} If data is not an array
   * 
   * @example
   * const series = new Series([1, 2, 3]);
   * 
   * @example
   * const series = new Series([10, 20, 30], {
   *   index: ['a', 'b', 'c'],
   *   name: 'values'
   * });
   */
  constructor(data, options = {}) {
    // Validate input
    validateArray(data, 'data');

    // Call parent constructor with spread operator
    super(...data);

    // Store metadata
    this._data = data;
    this._index = options.index || data.map((_, i) => i);
    this._name = options.name || '';
    this._type = inferArrayType(data);

    // Ensure properties are non-enumerable to avoid iteration issues
    Object.defineProperty(this, '_data', {
      value: this._data,
      writable: true,
      enumerable: false,
      configurable: true
    });

    Object.defineProperty(this, '_index', {
      value: this._index,
      writable: true,
      enumerable: false,
      configurable: true
    });

    Object.defineProperty(this, '_name', {
      value: this._name,
      writable: true,
      enumerable: false,
      configurable: true
    });

    Object.defineProperty(this, '_type', {
      value: this._type,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }

  /**
   * Gets the index labels for the Series.
   * 
   * @type {Array<string|number>}
   * @readonly
   * 
   * @example
   * const series = new Series([1, 2, 3], { index: ['a', 'b', 'c'] });
   * console.log(series.index); // ['a', 'b', 'c']
   */
  get index() {
    return this._index;
  }

  /**
   * Gets the name of the Series.
   * 
   * @type {string}
   * @readonly
   * 
   * @example
   * const series = new Series([1, 2, 3], { name: 'values' });
   * console.log(series.name); // 'values'
   */
  get name() {
    return this._name;
  }

  /**
   * Gets the inferred data type of the Series.
   * 
   * @type {string}
   * @readonly
   * 
   * @example
   * const series = new Series([1, 2, 3]);
   * console.log(series.dtype); // 'numeric'
   */
  get dtype() {
    return this._type;
  }

  /**
   * Gets the length of the Series.
   * 
   * @type {number}
   * @readonly
   * 
   * @example
   * const series = new Series([1, 2, 3]);
   * console.log(series.length); // 3
   */

  /**
   * Displays the Series in a formatted table.
   * Uses console.table to show index and values in a readable format.
   * 
   * @returns {void}
   * 
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * series.show;
   * // Displays:
   * // ┌─────────┬────────┐
   * // │ (index) │ Values │
   * // ├─────────┼────────┤
   * // │    a    │   10   │
   * // │    b    │   20   │
   * // │    c    │   30   │
   * // └─────────┴────────┘
   */
  get show() {
    const displayData = this._data.map((value, idx) => ({
      index: this._index[idx],
      value
    }));
    console.table(displayData);
  }

  /**
   * Gets a value by its index label.
   * 
   * @param {string|number} label - The index label to retrieve
   * @returns {*} The value at the specified index label
   * 
   * @throws {DataFrameError} If the label does not exist in the index
   * 
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * console.log(series.get('b')); // 20
   */
  get(label) {
    const idx = this._index.indexOf(label);
    if (idx === -1) {
      throw new DataFrameError(`Index label '${label}' not found in Series`, {
        operation: 'get',
        value: label,
        expected: `one of ${JSON.stringify(this._index)}`
      });
    }
    return this._data[idx];
  }

  /**
   * Sets a value by its index label.
   * 
   * @param {string|number} label - The index label to set
   * @param {*} value - The value to set
   * @returns {Series} Returns this Series for method chaining
   * 
   * @throws {DataFrameError} If the label does not exist in the index
   * 
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * series.set('b', 25);
   * console.log(series.get('b')); // 25
   */
  set(label, value) {
    const idx = this._index.indexOf(label);
    if (idx === -1) {
      throw new DataFrameError(`Index label '${label}' not found in Series`, {
        operation: 'set',
        value: label,
        expected: `one of ${JSON.stringify(this._index)}`
      });
    }
    this._data[idx] = value;
    return this;
  }

  /**
   * Applies a transformation function to each element.
   * Returns a new Series with transformed values.
   * 
   * @param {Function} fn - Transformation function that takes (value, index) and returns transformed value
   * @returns {Series} A new Series with transformed values
   * 
   * @throws {ValidationError} If fn is not a function
   * @throws {OperationError} If transformation function throws an error
   * 
   * @example
   * const series = new Series([1, 2, 3]);
   * const doubled = series.map(x => x * 2);
   * console.log(doubled); // Series([2, 4, 6])
   * 
   * @example
   * const series = new Series([1, 2, 3], { index: ['a', 'b', 'c'] });
   * const squared = series.map((x, i) => x * x);
   * console.log(squared); // Series([1, 4, 9])
   */
  map(fn) {
    validateFunction(fn, 'fn');

    try {
      const transformed = this._data.map((value, idx) => {
        try {
          return fn(value, idx);
        } catch (error) {
          throw new OperationError(
            `Transformation function failed at index ${idx}`,
            {
              operation: 'map',
              value,
              expected: 'function to succeed',
              actual: error.message
            }
          );
        }
      });

      return new Series(transformed, {
        index: this._index,
        name: this._name
      });
    } catch (error) {
      if (error instanceof OperationError) {
        throw error;
      }
      throw new OperationError('Map operation failed', {
        operation: 'map',
        expected: 'valid transformation function'
      });
    }
  }

  /**
   * Applies a transformation function to each element (alias for map).
   * Returns a new Series with transformed values.
   * 
   * @param {Function} fn - Transformation function that takes (value, index) and returns transformed value
   * @returns {Series} A new Series with transformed values
   * 
   * @throws {ValidationError} If fn is not a function
   * @throws {OperationError} If transformation function throws an error
   * 
   * @example
   * const series = new Series([1, 2, 3]);
   * const result = series.apply(x => x + 10);
   * console.log(result); // Series([11, 12, 13])
   */
  apply(fn) {
    return this.map(fn);
  }

  /**
   * Replaces values matching a condition with a new value.
   * Returns a new Series with replaced values.
   * 
   * @param {*} oldValue - The value to replace (or a function that returns true for values to replace)
   * @param {*} newValue - The value to replace with
   * @returns {Series} A new Series with replaced values
   * 
   * @example
   * const series = new Series([1, 2, 3, 2, 1]);
   * const replaced = series.replace(2, 99);
   * console.log(replaced); // Series([1, 99, 3, 99, 1])
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const replaced = series.replace(x => x > 3, 0);
   * console.log(replaced); // Series([1, 2, 3, 0, 0])
   */
  replace(oldValue, newValue) {
    const isFunction = typeof oldValue === 'function';

    const transformed = this._data.map(value => {
      const shouldReplace = isFunction ? oldValue(value) : value === oldValue;
      return shouldReplace ? newValue : value;
    });

    return new Series(transformed, {
      index: this._index,
      name: this._name
    });
  }

  /**
   * Computes the sum of all numeric values in the Series.
   * Non-numeric values and null/undefined are excluded.
   * 
   * @returns {number} The sum of all numeric values
   * 
   * @throws {TypeErrorClass} If Series contains no numeric values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * console.log(series.sum()); // 15
   * 
   * @example
   * const series = new Series([1, null, 3, undefined, 5]);
   * console.log(series.sum()); // 9 (null and undefined excluded)
   */
  sum() {
    const numericValues = this._data
      .map(v => toNumeric(v))
      .filter(v => v !== null);

    if (numericValues.length === 0) {
      throw new TypeErrorClass('Cannot compute sum of non-numeric Series', {
        operation: 'sum',
        expected: 'numeric values',
        actual: this._type
      });
    }

    return numericValues.reduce((acc, val) => acc + val, 0);
  }

  /**
   * Computes the count of non-null values in the Series.
   * 
   * @returns {number} The count of non-null values
   * 
   * @example
   * const series = new Series([1, 2, null, 4, undefined, 6]);
   * console.log(series.count()); // 4
   */
  count() {
    return this._data.filter(v => !isNull(v)).length;
  }

  /**
   * Computes the mean (average) of all numeric values in the Series.
   * Non-numeric values and null/undefined are excluded.
   * 
   * @returns {number} The mean of all numeric values
   * 
   * @throws {TypeErrorClass} If Series contains no numeric values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * console.log(series.mean()); // 3
   * 
   * @example
   * const series = new Series([10, 20, null, 30]);
   * console.log(series.mean()); // 20 (null excluded)
   */
  mean() {
    const numericValues = this._data
      .map(v => toNumeric(v))
      .filter(v => v !== null);

    if (numericValues.length === 0) {
      throw new TypeErrorClass('Cannot compute mean of non-numeric Series', {
        operation: 'mean',
        expected: 'numeric values',
        actual: this._type
      });
    }

    return numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length;
  }

  /**
   * Computes the median of all numeric values in the Series.
   * Non-numeric values and null/undefined are excluded.
   * 
   * @returns {number} The median of all numeric values
   * 
   * @throws {TypeErrorClass} If Series contains no numeric values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * console.log(series.median()); // 3
   * 
   * @example
   * const series = new Series([1, 2, 3, 4]);
   * console.log(series.median()); // 2.5
   */
  median() {
    const numericValues = this._data
      .map(v => toNumeric(v))
      .filter(v => v !== null)
      .sort((a, b) => a - b);

    if (numericValues.length === 0) {
      throw new TypeErrorClass('Cannot compute median of non-numeric Series', {
        operation: 'median',
        expected: 'numeric values',
        actual: this._type
      });
    }

    const mid = Math.floor(numericValues.length / 2);
    if (numericValues.length % 2 === 0) {
      return (numericValues[mid - 1] + numericValues[mid]) / 2;
    }
    return numericValues[mid];
  }

  /**
   * Computes the mode (most frequent value) of the Series.
   * Returns the first mode if multiple modes exist.
   * 
   * @returns {*} The most frequently occurring value
   * 
   * @throws {DataFrameError} If Series is empty
   * 
   * @example
   * const series = new Series([1, 2, 2, 3, 3, 3]);
   * console.log(series.mode()); // 3
   * 
   * @example
   * const series = new Series(['a', 'b', 'a', 'c', 'a']);
   * console.log(series.mode()); // 'a'
   */
  mode() {
    if (this._data.length === 0) {
      throw new DataFrameError('Cannot compute mode of empty Series', {
        operation: 'mode',
        expected: 'non-empty Series'
      });
    }

    const frequency = {};
    let maxCount = 0;
    let modeValue = null;

    for (const value of this._data) {
      if (!isNull(value)) {
        const key = String(value);
        frequency[key] = (frequency[key] || 0) + 1;
        if (frequency[key] > maxCount) {
          maxCount = frequency[key];
          modeValue = value;
        }
      }
    }

    if (modeValue === null) {
      throw new DataFrameError('Cannot compute mode of Series with only null values', {
        operation: 'mode',
        expected: 'at least one non-null value'
      });
    }

    return modeValue;
  }

  /**
   * Computes the minimum value in the Series.
   * For numeric Series, returns the smallest number.
   * For string Series, returns the lexicographically smallest value.
   * 
   * @returns {*} The minimum value
   * 
   * @throws {DataFrameError} If Series is empty or contains only null values
   * 
   * @example
   * const series = new Series([5, 2, 8, 1, 9]);
   * console.log(series.min()); // 1
   * 
   * @example
   * const series = new Series(['zebra', 'apple', 'mango']);
   * console.log(series.min()); // 'apple'
   */
  min() {
    const nonNullValues = this._data.filter(v => !isNull(v));

    if (nonNullValues.length === 0) {
      throw new DataFrameError('Cannot compute min of empty or all-null Series', {
        operation: 'min',
        expected: 'at least one non-null value'
      });
    }

    if (this._type === 'numeric') {
      const numericValues = nonNullValues.map(v => toNumeric(v)).filter(v => v !== null);
      if (numericValues.length === 0) {
        throw new TypeErrorClass('Cannot compute min of non-numeric Series', {
          operation: 'min',
          expected: 'numeric values',
          actual: this._type
        });
      }
      return Math.min(...numericValues);
    }

    return nonNullValues.reduce((min, val) => val < min ? val : min);
  }

  /**
   * Computes the maximum value in the Series.
   * For numeric Series, returns the largest number.
   * For string Series, returns the lexicographically largest value.
   * 
   * @returns {*} The maximum value
   * 
   * @throws {DataFrameError} If Series is empty or contains only null values
   * 
   * @example
   * const series = new Series([5, 2, 8, 1, 9]);
   * console.log(series.max()); // 9
   * 
   * @example
   * const series = new Series(['zebra', 'apple', 'mango']);
   * console.log(series.max()); // 'zebra'
   */
  max() {
    const nonNullValues = this._data.filter(v => !isNull(v));

    if (nonNullValues.length === 0) {
      throw new DataFrameError('Cannot compute max of empty or all-null Series', {
        operation: 'max',
        expected: 'at least one non-null value'
      });
    }

    if (this._type === 'numeric') {
      const numericValues = nonNullValues.map(v => toNumeric(v)).filter(v => v !== null);
      if (numericValues.length === 0) {
        throw new TypeErrorClass('Cannot compute max of non-numeric Series', {
          operation: 'max',
          expected: 'numeric values',
          actual: this._type
        });
      }
      return Math.max(...numericValues);
    }

    return nonNullValues.reduce((max, val) => val > max ? val : max);
  }

  /**
   * Computes the standard deviation of all numeric values in the Series.
   * Non-numeric values and null/undefined are excluded.
   * Uses sample standard deviation (divides by n-1).
   * 
   * @returns {number} The standard deviation
   * 
   * @throws {TypeErrorClass} If Series contains fewer than 2 numeric values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * console.log(series.std()); // ~1.58 (sample std dev)
   */
  std() {
    const numericValues = this._data
      .map(v => toNumeric(v))
      .filter(v => v !== null);

    if (numericValues.length < 2) {
      throw new TypeErrorClass('Cannot compute std of Series with fewer than 2 numeric values', {
        operation: 'std',
        expected: 'at least 2 numeric values',
        actual: `${numericValues.length} numeric values`
      });
    }

    const mean = numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length;
    const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (numericValues.length - 1);
    return Math.sqrt(variance);
  }

  /**
   * Computes the variance of all numeric values in the Series.
   * Non-numeric values and null/undefined are excluded.
   * Uses sample variance (divides by n-1).
   * 
   * @returns {number} The variance
   * 
   * @throws {TypeErrorClass} If Series contains fewer than 2 numeric values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * console.log(series.var()); // ~2.5 (sample variance)
   */
  var() {
    const numericValues = this._data
      .map(v => toNumeric(v))
      .filter(v => v !== null);

    if (numericValues.length < 2) {
      throw new TypeErrorClass('Cannot compute var of Series with fewer than 2 numeric values', {
        operation: 'var',
        expected: 'at least 2 numeric values',
        actual: `${numericValues.length} numeric values`
      });
    }

    const mean = numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length;
    const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (numericValues.length - 1);
    return variance;
  }

  /**
   * Sort Series by values.
   * Returns a new Series with sorted values and reordered index.
   * Null values are placed at the end regardless of sort order.
   * 
   * @param {boolean} [ascending=true] - Sort order. If true, sort in ascending order; if false, descending.
   * @returns {Series} A new Series with sorted values and reordered index.
   * 
   * @example
   * // Sort numeric values in ascending order
   * const series = new Series([3, 1, 2], { index: ['a', 'b', 'c'] });
   * const sorted = series.sort_values();
   * console.log(sorted.values); // [1, 2, 3]
   * console.log(sorted.index); // ['b', 'c', 'a']
   * 
   * @example
   * // Sort numeric values in descending order
   * const series = new Series([3, 1, 2], { index: ['a', 'b', 'c'] });
   * const sorted = series.sort_values(false);
   * console.log(sorted.values); // [3, 2, 1]
   * console.log(sorted.index); // ['a', 'c', 'b']
   * 
   * @example
   * // Sort string values
   * const series = new Series(['banana', 'apple', 'cherry'], { index: [0, 1, 2] });
   * const sorted = series.sort_values();
   * console.log(sorted.values); // ['apple', 'banana', 'cherry']
   * 
   * @example
   * // Null values are placed at the end
   * const series = new Series([3, null, 1, 2], { index: ['a', 'b', 'c', 'd'] });
   * const sorted = series.sort_values();
   * console.log(sorted.values); // [1, 2, 3, null]
   * console.log(sorted.index); // ['c', 'd', 'a', 'b']
   */
  sort_values(ascending = true) {
    // Create array of [value, index, originalPosition] tuples
    const tuples = this._data.map((value, idx) => [value, this._index[idx], idx]);

    // Separate null and non-null values
    const nullTuples = tuples.filter(([value]) => isNull(value));
    const nonNullTuples = tuples.filter(([value]) => !isNull(value));

    // Sort non-null values
    nonNullTuples.sort((a, b) => {
      const valA = a[0];
      const valB = b[0];

      // Handle numeric comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return ascending ? valA - valB : valB - valA;
      }

      // Handle string comparison
      const strA = String(valA);
      const strB = String(valB);

      if (ascending) {
        return strA < strB ? -1 : strA > strB ? 1 : 0;
      } else {
        return strA > strB ? -1 : strA < strB ? 1 : 0;
      }
    });

    // Combine sorted non-null values with null values at the end
    const sortedTuples = [...nonNullTuples, ...nullTuples];

    // Extract sorted values and indices
    const sortedValues = sortedTuples.map(([value]) => value);
    const sortedIndex = sortedTuples.map(([, index]) => index);

    return new Series(sortedValues, {
      index: sortedIndex,
      name: this._name
    });
  }

  /**
   * Sort Series by index labels.
   * Returns a new Series with values reordered according to sorted index.
   * 
   * @param {boolean} [ascending=true] - Sort order. If true, sort in ascending order; if false, descending.
   * @returns {Series} A new Series with values reordered according to sorted index.
   * 
   * @example
   * // Sort by numeric index
   * const series = new Series([30, 10, 20], { index: [2, 0, 1] });
   * const sorted = series.sort_index();
   * console.log(sorted.values); // [10, 20, 30]
   * console.log(sorted.index); // [0, 1, 2]
   * 
   * @example
   * // Sort by string index in descending order
   * const series = new Series([1, 2, 3], { index: ['c', 'a', 'b'] });
   * const sorted = series.sort_index(false);
   * console.log(sorted.values); // [1, 3, 2]
   * console.log(sorted.index); // ['c', 'b', 'a']
   * 
   * @example
   * // Sort by string index in ascending order
   * const series = new Series([100, 200, 300], { index: ['zebra', 'apple', 'mango'] });
   * const sorted = series.sort_index();
   * console.log(sorted.values); // [200, 300, 100]
   * console.log(sorted.index); // ['apple', 'mango', 'zebra']
   */
  sort_index(ascending = true) {
    // Create array of [index, value, originalPosition] tuples
    const tuples = this._index.map((index, idx) => [index, this._data[idx], idx]);

    // Sort by index
    tuples.sort((a, b) => {
      const idxA = a[0];
      const idxB = b[0];

      // Handle numeric comparison
      if (typeof idxA === 'number' && typeof idxB === 'number') {
        return ascending ? idxA - idxB : idxB - idxA;
      }

      // Handle string comparison
      const strA = String(idxA);
      const strB = String(idxB);

      if (ascending) {
        return strA < strB ? -1 : strA > strB ? 1 : 0;
      } else {
        return strA > strB ? -1 : strA < strB ? 1 : 0;
      }
    });

    // Extract sorted indices and values
    const sortedIndex = tuples.map(([index]) => index);
    const sortedValues = tuples.map(([, value]) => value);

    return new Series(sortedValues, {
      index: sortedIndex,
      name: this._name
    });
  }

  /**
   * Fill null/undefined values with a specified value.
   * Returns a new Series with null values replaced by the provided value.
   *
   * @param {*} value - The value to use for filling null/undefined values
   * @returns {Series} A new Series with null values filled
   *
   * @example
   * const series = new Series([1, null, 3, undefined, 5]);
   * const filled = series.fillna(0);
   * console.log(filled._data); // [1, 0, 3, 0, 5]
   *
   * @example
   * const series = new Series(['a', null, 'c'], { index: ['x', 'y', 'z'] });
   * const filled = series.fillna('missing');
   * console.log(filled._data); // ['a', 'missing', 'c']
   * console.log(filled._index); // ['x', 'y', 'z']
   */
  fillna(value) {
    const filledData = this._data.map(val => isNull(val) ? value : val);

    return new Series(filledData, {
      index: this._index.slice(),
      name: this._name
    });
  }

  /**
   * Remove null/undefined values from the Series.
   * Returns a new Series with null values removed and index adjusted accordingly.
   *
   * @returns {Series} A new Series with null values removed
   *
   * @example
   * const series = new Series([1, null, 3, undefined, 5]);
   * const cleaned = series.dropna();
   * console.log(cleaned._data); // [1, 3, 5]
   * console.log(cleaned._index); // [0, 2, 4]
   *
   * @example
   * const series = new Series(['a', null, 'c'], { index: ['x', 'y', 'z'] });
   * const cleaned = series.dropna();
   * console.log(cleaned._data); // ['a', 'c']
   * console.log(cleaned._index); // ['x', 'z']
   */
  dropna() {
    const filteredData = [];
    const filteredIndex = [];

    for (let i = 0; i < this._data.length; i++) {
      if (!isNull(this._data[i])) {
        filteredData.push(this._data[i]);
        filteredIndex.push(this._index[i]);
      }
    }

    return new Series(filteredData, {
      index: filteredIndex,
      name: this._name
    });
  }

  /**
   * Return a boolean Series indicating null values.
   * Returns a new Series of booleans where true indicates null/undefined values
   * and false indicates non-null values. The index is preserved.
   *
   * @returns {Series} A new Series of boolean values
   *
   * @example
   * const series = new Series([1, null, 3, undefined, 5]);
   * const nullMask = series.isna();
   * console.log(nullMask._data); // [false, true, false, true, false]
   *
   * @example
   * const series = new Series(['a', null, 'c'], { index: ['x', 'y', 'z'] });
   * const nullMask = series.isna();
   * console.log(nullMask._data); // [false, true, false]
   * console.log(nullMask._index); // ['x', 'y', 'z']
   */
  isna() {
    const booleanData = this._data.map(val => isNull(val));

    return new Series(booleanData, {
      index: this._index.slice(),
      name: this._name
    });
  }

  /**
   * Return a boolean Series indicating non-null values.
   * Returns a new Series of booleans where false indicates null/undefined values
   * and true indicates non-null values. The index is preserved.
   *
   * @returns {Series} A new Series of boolean values
   *
   * @example
   * const series = new Series([1, null, 3, undefined, 5]);
   * const notNullMask = series.notna();
   * console.log(notNullMask._data); // [true, false, true, false, true]
   *
   * @example
   * const series = new Series(['a', null, 'c'], { index: ['x', 'y', 'z'] });
   * const notNullMask = series.notna();
   * console.log(notNullMask._data); // [true, false, true]
   * console.log(notNullMask._index); // ['x', 'y', 'z']
   */
  notna() {
    const booleanData = this._data.map(val => !isNull(val));

    return new Series(booleanData, {
      index: this._index.slice(),
      name: this._name
    });
  }

  /**
   * Return unique values in the Series.
   * Returns a new Series with only unique values, preserving the order of first occurrence.
   * Handles null values by treating them as unique values.
   *
   * @returns {Series} A new Series with unique values only
   *
   * @example
   * const series = new Series([1, 2, 2, 3, 1, 4]);
   * const unique = series.unique();
   * console.log(unique._data); // [1, 2, 3, 4]
   *
   * @example
   * const series = new Series(['a', 'b', 'a', null, 'b', null, 'c']);
   * const unique = series.unique();
   * console.log(unique._data); // ['a', 'b', null, 'c']
   *
   * @example
   * const series = new Series([1, 2, 2, 3], { index: ['w', 'x', 'y', 'z'], name: 'values' });
   * const unique = series.unique();
   * console.log(unique._data); // [1, 2, 3]
   * console.log(unique._index); // [0, 1, 2]
   */
  unique() {
    const uniqueData = [];
    const seen = new Set();

    for (let i = 0; i < this._data.length; i++) {
      const val = this._data[i];
      // Handle null values specially since Set treats null as a unique value
      const key = isNull(val) ? '__NULL__' : val;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueData.push(val);
      }
    }

    return new Series(uniqueData, {
      index: Array.from({ length: uniqueData.length }, (_, i) => i),
      name: this._name
    });
  }

  /**
   * Count occurrences of each unique value in the Series.
   * Returns a new Series with unique values as the index and their counts as values.
   * By default, results are sorted by count in descending order.
   * Handles null values by counting them as a separate category.
   *
   * @returns {Series} A new Series with unique values as index and counts as values
   *
   * @example
   * const series = new Series([1, 2, 2, 3, 1, 1, 4]);
   * const counts = series.value_counts();
   * console.log(counts._index); // [1, 2, 3, 4]
   * console.log(counts._data); // [3, 2, 1, 1]
   *
   * @example
   * const series = new Series(['a', 'b', 'a', null, 'b', null, 'c']);
   * const counts = series.value_counts();
   * console.log(counts._index); // ['a', 'b', null, 'c']
   * console.log(counts._data); // [2, 2, 2, 1]
   *
   * @example
   * const series = new Series([1, 1, 2, 2, 2, 3], { name: 'numbers' });
   * const counts = series.value_counts();
   * console.log(counts.name); // 'numbers'
   * console.log(counts._index); // [2, 1, 3]
   * console.log(counts._data); // [3, 2, 1]
   */
  value_counts() {
    const countMap = new Map();

    // Count occurrences
    for (let i = 0; i < this._data.length; i++) {
      const val = this._data[i];
      // Use a special key for null values
      const key = isNull(val) ? '__NULL__' : val;

      if (countMap.has(key)) {
        countMap.set(key, countMap.get(key) + 1);
      } else {
        countMap.set(key, 1);
      }
    }

    // Convert to arrays and sort by count (descending)
    const entries = Array.from(countMap.entries());
    entries.sort((a, b) => b[1] - a[1]);

    const indexData = entries.map(([key, _]) => key === '__NULL__' ? null : key);
    const countData = entries.map(([_, count]) => count);

    return new Series(countData, {
      index: indexData,
      name: this._name
    });
  }

  /**
   * Return boolean Series marking duplicate values.
   * Returns a new Series of booleans where true indicates a duplicate value
   * and false indicates the first (or last, or all) occurrence based on the keep parameter.
   * The original index is preserved.
   *
   * @param {string|boolean} [keep='first'] - Which duplicates to mark:
   *   - 'first': Mark all duplicates except the first occurrence as true
   *   - 'last': Mark all duplicates except the last occurrence as true
   *   - false: Mark all duplicates (including first occurrence) as true
   * @returns {Series} A new Series of boolean values indicating duplicates
   *
   * @example
   * const series = new Series([1, 2, 2, 3, 1, 4]);
   * const dups = series.duplicated();
   * console.log(dups._data); // [false, false, true, false, true, false]
   *
   * @example
   * const series = new Series([1, 2, 2, 3, 1, 4]);
   * const dups = series.duplicated('last');
   * console.log(dups._data); // [true, false, true, false, false, false]
   *
   * @example
   * const series = new Series([1, 2, 2, 3, 1, 4]);
   * const dups = series.duplicated(false);
   * console.log(dups._data); // [true, true, true, false, true, false]
   *
   * @example
   * const series = new Series(['a', 'b', 'a', null, 'b', null], { index: ['x', 'y', 'z', 'w', 'v', 'u'] });
   * const dups = series.duplicated();
   * console.log(dups._data); // [false, false, true, false, true, true]
   * console.log(dups._index); // ['x', 'y', 'z', 'w', 'v', 'u']
   */
  duplicated(keep = 'first') {
    const booleanData = new Array(this._data.length);
    const seen = new Map();

    if (keep === 'first') {
      // Mark all duplicates except first occurrence
      for (let i = 0; i < this._data.length; i++) {
        const val = this._data[i];
        const key = isNull(val) ? '__NULL__' : val;

        if (seen.has(key)) {
          booleanData[i] = true;
        } else {
          booleanData[i] = false;
          seen.set(key, i);
        }
      }
    } else if (keep === 'last') {
      // Mark all duplicates except last occurrence
      // First pass: find last occurrence of each value
      const lastOccurrence = new Map();
      for (let i = 0; i < this._data.length; i++) {
        const val = this._data[i];
        const key = isNull(val) ? '__NULL__' : val;
        lastOccurrence.set(key, i);
      }

      // Second pass: mark duplicates
      for (let i = 0; i < this._data.length; i++) {
        const val = this._data[i];
        const key = isNull(val) ? '__NULL__' : val;
        booleanData[i] = (lastOccurrence.get(key) !== i);
      }
    } else if (keep === false) {
      // Mark all duplicates (including first occurrence)
      const countMap = new Map();

      // First pass: count occurrences
      for (let i = 0; i < this._data.length; i++) {
        const val = this._data[i];
        const key = isNull(val) ? '__NULL__' : val;
        countMap.set(key, (countMap.get(key) || 0) + 1);
      }

      // Second pass: mark all values that appear more than once
      for (let i = 0; i < this._data.length; i++) {
        const val = this._data[i];
        const key = isNull(val) ? '__NULL__' : val;
        booleanData[i] = countMap.get(key) > 1;
      }
    } else {
      throw new OperationError(`Invalid value for 'keep' parameter: ${keep}. Must be 'first', 'last', or false.`);
    }

    return new Series(booleanData, {
      index: this._index.slice(),
      name: this._name
    });
  }

  /**
   * Remove duplicate values from the Series.
   * Returns a new Series with duplicate values removed based on the keep parameter.
   * The index is adjusted to match the kept values.
   *
   * @param {string|boolean} [keep='first'] - Which duplicates to keep:
   *   - 'first': Keep the first occurrence of each value
   *   - 'last': Keep the last occurrence of each value
   *   - false: Remove all duplicates (keep only unique values that appear once)
   * @returns {Series} A new Series with duplicates removed
   *
   * @example
   * const series = new Series([1, 2, 2, 3, 1, 4]);
   * const unique = series.drop_duplicates();
   * console.log(unique._data); // [1, 2, 3, 4]
   * console.log(unique._index); // [0, 1, 3, 5]
   *
   * @example
   * const series = new Series([1, 2, 2, 3, 1, 4]);
   * const unique = series.drop_duplicates('last');
   * console.log(unique._data); // [2, 3, 1, 4]
   * console.log(unique._index); // [2, 3, 4, 5]
   *
   * @example
   * const series = new Series([1, 2, 2, 3, 1, 4]);
   * const unique = series.drop_duplicates(false);
   * console.log(unique._data); // [3, 4]
   * console.log(unique._index); // [3, 5]
   *
   * @example
   * const series = new Series(['a', 'b', 'a', null, 'b', null, 'c'], { index: ['x', 'y', 'z', 'w', 'v', 'u', 't'] });
   * const unique = series.drop_duplicates();
   * console.log(unique._data); // ['a', 'b', null, 'c']
   * console.log(unique._index); // ['x', 'y', 'w', 't']
   */
  drop_duplicates(keep = 'first') {
    const resultData = [];
    const resultIndex = [];
    const seen = new Map();

    if (keep === 'first') {
      // Keep first occurrence of each value
      for (let i = 0; i < this._data.length; i++) {
        const val = this._data[i];
        const key = isNull(val) ? '__NULL__' : val;

        if (!seen.has(key)) {
          seen.set(key, true);
          resultData.push(val);
          resultIndex.push(this._index[i]);
        }
      }
    } else if (keep === 'last') {
      // Keep last occurrence of each value
      // First pass: find last occurrence of each value
      const lastOccurrence = new Map();
      for (let i = 0; i < this._data.length; i++) {
        const val = this._data[i];
        const key = isNull(val) ? '__NULL__' : val;
        lastOccurrence.set(key, i);
      }

      // Second pass: keep only last occurrences
      for (let i = 0; i < this._data.length; i++) {
        const val = this._data[i];
        const key = isNull(val) ? '__NULL__' : val;

        if (lastOccurrence.get(key) === i) {
          resultData.push(val);
          resultIndex.push(this._index[i]);
        }
      }
    } else if (keep === false) {
      // Keep only values that appear exactly once
      const countMap = new Map();

      // First pass: count occurrences
      for (let i = 0; i < this._data.length; i++) {
        const val = this._data[i];
        const key = isNull(val) ? '__NULL__' : val;
        countMap.set(key, (countMap.get(key) || 0) + 1);
      }

      // Second pass: keep only values that appear once
      for (let i = 0; i < this._data.length; i++) {
        const val = this._data[i];
        const key = isNull(val) ? '__NULL__' : val;

        if (countMap.get(key) === 1) {
          resultData.push(val);
          resultIndex.push(this._index[i]);
        }
      }
    } else {
      throw new OperationError(`Invalid value for 'keep' parameter: ${keep}. Must be 'first', 'last', or false.`);
    }

    return new Series(resultData, {
      index: resultIndex,
      name: this._name
    });
  }


}

/**
 * Factory function to create a new Series instance.
 * Provides a convenient way to create Series without using the new keyword.
 * 
 * @param {Array} data - The data for the Series
 * @param {Object} [options={}] - Configuration options
 * @returns {Series} A new Series instance
 * 
 * @example
 * const series = Series([1, 2, 3]);
 * 
 * @example
 * const series = Series([10, 20, 30], {
 *   index: ['a', 'b', 'c'],
 *   name: 'values'
 * });
 */
function createSeries(data, options = {}) {
  return new Series(data, options);
}

module.exports = Series;
module.exports.createSeries = createSeries;
