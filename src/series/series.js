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
  IndexError,
  TypeError: TypeErrorClass,
  OperationError
} = require('../utils/errors');

const { getLogger } = require('../utils/logger');

const logger = getLogger();

/**
 * RollingWindow class - Provides rolling window operations for Series.
 * Accessed via the Series.rolling() method, this class offers pandas-like rolling
 * window calculations that compute statistics over a sliding window.
 * 
 * @class RollingWindow
 * 
 * @example
 * const series = new Series([1, 2, 3, 4, 5]);
 * const rollingMean = series.rolling(3).mean();
 * // Returns Series with rolling 3-period mean
 */
class RollingWindow {
  /**
   * Creates a new RollingWindow instance.
   * 
   * @param {Series} series - The Series instance to operate on
   * @param {number} window - The size of the rolling window
   * 
   * @example
   * // Typically accessed via series.rolling(), not instantiated directly
   * const rolling = new RollingWindow(series, 3);
   */
  constructor(series, window) {
    validateNumber(window, 'window');
    if (window <= 0) {
      throw new ValidationError('Window size must be greater than 0');
    }
    this._series = series;
    this._window = window;
  }

  /**
   * Calculate rolling mean over the window.
   * 
   * @returns {Series} A new Series with rolling mean values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const result = series.rolling(3).mean();
   * // Returns Series: [null, null, 2, 3, 4]
   */
  mean() {
    const resultData = [];
    const data = this._series._data;

    for (let i = 0; i < data.length; i++) {
      if (i < this._window - 1) {
        resultData.push(null);
        continue;
      }

      let sum = 0;
      let count = 0;

      for (let j = i - this._window + 1; j <= i; j++) {
        const val = data[j];
        if (!isNull(val)) {
          const numVal = toNumeric(val);
          if (!isNull(numVal)) {
            sum += numVal;
            count++;
          }
        }
      }

      resultData.push(count > 0 ? sum / count : null);
    }

    return new Series(resultData, {
      index: this._series._index,
      name: this._series._name
    });
  }

  /**
   * Calculate rolling sum over the window.
   * 
   * @returns {Series} A new Series with rolling sum values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const result = series.rolling(3).sum();
   * // Returns Series: [null, null, 6, 9, 12]
   */
  sum() {
    const resultData = [];
    const data = this._series._data;

    for (let i = 0; i < data.length; i++) {
      if (i < this._window - 1) {
        resultData.push(null);
        continue;
      }

      let sum = 0;
      let count = 0;

      for (let j = i - this._window + 1; j <= i; j++) {
        const val = data[j];
        if (!isNull(val)) {
          const numVal = toNumeric(val);
          if (!isNull(numVal)) {
            sum += numVal;
            count++;
          }
        }
      }

      resultData.push(count > 0 ? sum : null);
    }

    return new Series(resultData, {
      index: this._series._index,
      name: this._series._name
    });
  }

  /**
   * Calculate rolling minimum over the window.
   * 
   * @returns {Series} A new Series with rolling minimum values
   * 
   * @example
   * const series = new Series([5, 2, 8, 1, 9]);
   * const result = series.rolling(3).min();
   * // Returns Series: [null, null, 2, 1, 1]
   */
  min() {
    const resultData = [];
    const data = this._series._data;

    for (let i = 0; i < data.length; i++) {
      if (i < this._window - 1) {
        resultData.push(null);
        continue;
      }

      let min = Infinity;
      let hasValue = false;

      for (let j = i - this._window + 1; j <= i; j++) {
        const val = data[j];
        if (!isNull(val)) {
          const numVal = toNumeric(val);
          if (!isNull(numVal)) {
            min = Math.min(min, numVal);
            hasValue = true;
          }
        }
      }

      resultData.push(hasValue ? min : null);
    }

    return new Series(resultData, {
      index: this._series._index,
      name: this._series._name
    });
  }

  /**
   * Calculate rolling maximum over the window.
   * 
   * @returns {Series} A new Series with rolling maximum values
   * 
   * @example
   * const series = new Series([5, 2, 8, 1, 9]);
   * const result = series.rolling(3).max();
   * // Returns Series: [null, null, 8, 8, 9]
   */
  max() {
    const resultData = [];
    const data = this._series._data;

    for (let i = 0; i < data.length; i++) {
      if (i < this._window - 1) {
        resultData.push(null);
        continue;
      }

      let max = -Infinity;
      let hasValue = false;

      for (let j = i - this._window + 1; j <= i; j++) {
        const val = data[j];
        if (!isNull(val)) {
          const numVal = toNumeric(val);
          if (!isNull(numVal)) {
            max = Math.max(max, numVal);
            hasValue = true;
          }
        }
      }

      resultData.push(hasValue ? max : null);
    }

    return new Series(resultData, {
      index: this._series._index,
      name: this._series._name
    });
  }

  /**
   * Calculate rolling standard deviation over the window.
   * 
   * @returns {Series} A new Series with rolling standard deviation values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const result = series.rolling(3).std();
   * // Returns Series with rolling 3-period standard deviation
   */
  std() {
    const resultData = [];
    const data = this._series._data;

    for (let i = 0; i < data.length; i++) {
      if (i < this._window - 1) {
        resultData.push(null);
        continue;
      }

      const values = [];

      for (let j = i - this._window + 1; j <= i; j++) {
        const val = data[j];
        if (!isNull(val)) {
          const numVal = toNumeric(val);
          if (!isNull(numVal)) {
            values.push(numVal);
          }
        }
      }

      if (values.length === 0) {
        resultData.push(null);
        continue;
      }

      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      resultData.push(Math.sqrt(variance));
    }

    return new Series(resultData, {
      index: this._series._index,
      name: this._series._name
    });
  }
}

/**
 * ExpandingWindow class - Provides expanding window operations for Series.
 * Accessed via the Series.expanding() method, this class offers pandas-like expanding
 * window calculations that compute cumulative statistics from the start.
 * 
 * @class ExpandingWindow
 * 
 * @example
 * const series = new Series([1, 2, 3, 4, 5]);
 * const expandingMean = series.expanding().mean();
 * // Returns Series with expanding mean: [1, 1.5, 2, 2.5, 3]
 */
class ExpandingWindow {
  /**
   * Creates a new ExpandingWindow instance.
   * 
   * @param {Series} series - The Series instance to operate on
   * 
   * @example
   * // Typically accessed via series.expanding(), not instantiated directly
   * const expanding = new ExpandingWindow(series);
   */
  constructor(series) {
    this._series = series;
  }

  /**
   * Calculate expanding mean from the start.
   * 
   * @returns {Series} A new Series with expanding mean values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const result = series.expanding().mean();
   * // Returns Series: [1, 1.5, 2, 2.5, 3]
   */
  mean() {
    const resultData = [];
    const data = this._series._data;
    let sum = 0;
    let count = 0;

    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      if (!isNull(val)) {
        const numVal = toNumeric(val);
        if (!isNull(numVal)) {
          sum += numVal;
          count++;
        }
      }

      resultData.push(count > 0 ? sum / count : null);
    }

    return new Series(resultData, {
      index: this._series._index,
      name: this._series._name
    });
  }

  /**
   * Calculate expanding sum from the start.
   * 
   * @returns {Series} A new Series with expanding sum values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const result = series.expanding().sum();
   * // Returns Series: [1, 3, 6, 10, 15]
   */
  sum() {
    const resultData = [];
    const data = this._series._data;
    let sum = 0;
    let count = 0;

    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      if (!isNull(val)) {
        const numVal = toNumeric(val);
        if (!isNull(numVal)) {
          sum += numVal;
          count++;
        }
      }

      resultData.push(count > 0 ? sum : null);
    }

    return new Series(resultData, {
      index: this._series._index,
      name: this._series._name
    });
  }

  /**
   * Calculate expanding minimum from the start.
   * 
   * @returns {Series} A new Series with expanding minimum values
   * 
   * @example
   * const series = new Series([5, 2, 8, 1, 9]);
   * const result = series.expanding().min();
   * // Returns Series: [5, 2, 2, 1, 1]
   */
  min() {
    const resultData = [];
    const data = this._series._data;
    let min = Infinity;
    let hasValue = false;

    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      if (!isNull(val)) {
        const numVal = toNumeric(val);
        if (!isNull(numVal)) {
          min = Math.min(min, numVal);
          hasValue = true;
        }
      }

      resultData.push(hasValue ? min : null);
    }

    return new Series(resultData, {
      index: this._series._index,
      name: this._series._name
    });
  }

  /**
   * Calculate expanding maximum from the start.
   * 
   * @returns {Series} A new Series with expanding maximum values
   * 
   * @example
   * const series = new Series([5, 2, 8, 1, 9]);
   * const result = series.expanding().max();
   * // Returns Series: [5, 5, 8, 8, 9]
   */
  max() {
    const resultData = [];
    const data = this._series._data;
    let max = -Infinity;
    let hasValue = false;

    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      if (!isNull(val)) {
        const numVal = toNumeric(val);
        if (!isNull(numVal)) {
          max = Math.max(max, numVal);
          hasValue = true;
        }
      }

      resultData.push(hasValue ? max : null);
    }

    return new Series(resultData, {
      index: this._series._index,
      name: this._series._name
    });
  }

  /**
   * Calculate expanding standard deviation from the start.
   * 
   * @returns {Series} A new Series with expanding standard deviation values
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const result = series.expanding().std();
   * // Returns Series with expanding standard deviation
   */
  std() {
    const resultData = [];
    const data = this._series._data;
    const values = [];

    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      if (!isNull(val)) {
        const numVal = toNumeric(val);
        if (!isNull(numVal)) {
          values.push(numVal);
        }
      }

      if (values.length === 0) {
        resultData.push(null);
        continue;
      }

      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      resultData.push(Math.sqrt(variance));
    }

    return new Series(resultData, {
      index: this._series._index,
      name: this._series._name
    });
  }
}

/**
 * LocIndexer class - Provides label-based indexing for Series.
 * Accessed via the Series.loc property, this class offers pandas-like label-based
 * indexing that allows getting and setting values by index labels.
 * 
 * @class LocIndexer
 * 
 * @example
 * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
 * const value = series.loc.get('b'); // 20
 * const subset = series.loc.get(['a', 'c']); // Series with values [10, 30]
 * series.loc.set('b', 25); // Sets value at label 'b' to 25
 */
class LocIndexer {
  /**
   * Creates a new LocIndexer instance.
   * 
   * @param {Series} series - The Series instance to operate on
   * 
   * @example
   * // Typically accessed via series.loc, not instantiated directly
   * const locIndexer = new LocIndexer(series);
   */
  constructor(series) {
    this._series = series;
  }

  /**
   * Gets value(s) by index label(s).
   * 
   * @param {string|number|Array<string|number>} label - Single label or array of labels
   * @returns {*|Series} Single value if label is scalar, Series if label is array
   * 
   * @throws {DataFrameError} If any label does not exist in the index
   * 
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * console.log(series.loc.get('b')); // 20
   * 
   * @example
   * const subset = series.loc.get(['a', 'c']);
   * console.log(subset); // Series with values [10, 30] and index ['a', 'c']
   */
  get(label) {
    if (Array.isArray(label)) {
      // Handle array of labels - return a new Series
      const data = [];
      const index = [];
      
      for (const lbl of label) {
        const idx = this._series._index.indexOf(lbl);
        if (idx === -1) {
          throw new DataFrameError(`Index label '${lbl}' not found in Series`, {
            operation: 'loc.get',
            value: lbl,
            expected: `one of ${JSON.stringify(this._series._index)}`
          });
        }
        data.push(this._series._data[idx]);
        index.push(lbl);
      }
      
      return new Series(data, { 
        index: index, 
        name: this._series._name 
      });
    } else {
      // Handle single label - return the value
      const idx = this._series._index.indexOf(label);
      if (idx === -1) {
        throw new DataFrameError(`Index label '${label}' not found in Series`, {
          operation: 'loc.get',
          value: label,
          expected: `one of ${JSON.stringify(this._series._index)}`
        });
      }
      return this._series._data[idx];
    }
  }

  /**
   * Sets value at the specified index label.
   * 
   * @param {string|number} label - The index label to set
   * @param {*} value - The value to set
   * @returns {void}
   * 
   * @throws {DataFrameError} If the label does not exist in the index
   * 
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * series.loc.set('b', 25);
   * console.log(series.get('b')); // 25
   */
  set(label, value) {
    const idx = this._series._index.indexOf(label);
    if (idx === -1) {
      throw new DataFrameError(`Index label '${label}' not found in Series`, {
        operation: 'loc.set',
        value: label,
        expected: `one of ${JSON.stringify(this._series._index)}`
      });
    }
    this._series._data[idx] = value;
  }
}

/**
 * ILocIndexer class - Provides position-based indexing for Series.
 * Accessed via the Series.iloc property, this class offers pandas-like integer-based
 * indexing that allows getting and setting values by integer positions.
 * 
 * @class ILocIndexer
 * 
 * @example
 * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
 * const value = series.iloc.get(1); // 20
 * const subset = series.iloc.get([0, 2]); // Series with values [10, 30]
 * series.iloc.set(1, 25); // Sets value at position 1 to 25
 */
class ILocIndexer {
  /**
   * Creates a new ILocIndexer instance.
   * 
   * @param {Series} series - The Series instance to operate on
   * 
   * @example
   * // Typically accessed via series.iloc, not instantiated directly
   * const ilocIndexer = new ILocIndexer(series);
   */
  constructor(series) {
    this._series = series;
  }

  /**
   * Gets value(s) by integer position(s).
   * 
   * @param {number|Array<number>} position - Single position or array of positions
   * @returns {*|Series} Single value if position is scalar, Series if position is array
   * 
   * @throws {DataFrameError} If any position is out of bounds
   * 
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * console.log(series.iloc.get(1)); // 20
   * 
   * @example
   * const subset = series.iloc.get([0, 2]);
   * console.log(subset); // Series with values [10, 30] and index ['a', 'c']
   */
  get(position) {
    if (Array.isArray(position)) {
      // Handle array of positions - return a new Series
      const data = [];
      const index = [];
      
      for (const pos of position) {
        if (!Number.isInteger(pos) || pos < 0 || pos >= this._series._data.length) {
          throw new DataFrameError(`Position ${pos} is out of bounds for Series of length ${this._series._data.length}`, {
            operation: 'iloc.get',
            value: pos,
            expected: `integer between 0 and ${this._series._data.length - 1}`
          });
        }
        data.push(this._series._data[pos]);
        index.push(this._series._index[pos]);
      }
      
      return new Series(data, { 
        index: index, 
        name: this._series._name 
      });
    } else {
      // Handle single position - return the value
      if (!Number.isInteger(position) || position < 0 || position >= this._series._data.length) {
        throw new DataFrameError(`Position ${position} is out of bounds for Series of length ${this._series._data.length}`, {
          operation: 'iloc.get',
          value: position,
          expected: `integer between 0 and ${this._series._data.length - 1}`
        });
      }
      return this._series._data[position];
    }
  }

  /**
   * Sets value at the specified integer position.
   * 
   * @param {number} position - The integer position to set
   * @param {*} value - The value to set
   * @returns {void}
   * 
   * @throws {DataFrameError} If the position is out of bounds
   * 
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * series.iloc.set(1, 25);
   * console.log(series.iloc.get(1)); // 25
   */
  set(position, value) {
    if (!Number.isInteger(position) || position < 0 || position >= this._series._data.length) {
      throw new DataFrameError(`Position ${position} is out of bounds for Series of length ${this._series._data.length}`, {
        operation: 'iloc.set',
        value: position,
        expected: `integer between 0 and ${this._series._data.length - 1}`
      });
    }
    this._series._data[position] = value;
  }
}

/**
 * SeriesAtIndexer class - Fast scalar label-based accessor for Series.
 * Accessed via the Series.at property, this class offers pandas-like fast
 * scalar access by index label. Unlike LocIndexer, it rejects array/slice
 * arguments and only supports single scalar labels for both get and set.
 * Mirrors pandas `s.at[label]` semantics.
 *
 * @class SeriesAtIndexer
 *
 * @example
 * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
 * const value = series.at.get('b'); // 20
 * series.at.set('b', 99); // Sets value at label 'b' to 99 in place
 */
class SeriesAtIndexer {
  /**
   * Creates a new SeriesAtIndexer instance.
   *
   * @param {Series} series - The Series instance to operate on
   *
   * @example
   * // Typically accessed via series.at, not instantiated directly
   * const atIndexer = new SeriesAtIndexer(series);
   */
  constructor(series) {
    this._series = series;
  }

  /**
   * Gets the scalar value at the specified index label.
   * Only accepts a single scalar label; arrays are rejected.
   *
   * @param {string|number} label - The index label to look up
   * @returns {*} The value at the given label
   *
   * @throws {ValidationError} If `label` is an array
   * @throws {IndexError} If the label does not exist in the index
   *
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * console.log(series.at.get('b')); // 20
   */
  get(label) {
    if (Array.isArray(label)) {
      throw new ValidationError('at.get accepts only scalar labels, not arrays', {
        operation: 'Series.at.get',
        value: label,
        expected: 'scalar'
      });
    }
    const idx = this._series._index.indexOf(label);
    if (idx === -1) {
      throw new IndexError(`Label '${label}' not found in index`, {
        operation: 'Series.at.get',
        value: label,
        expected: `one of ${JSON.stringify(this._series._index)}`
      });
    }
    return this._series._data[idx];
  }

  /**
   * Sets the scalar value at the specified index label in place.
   * Only accepts a single scalar label; arrays are rejected. Returns the
   * underlying Series to allow chaining.
   *
   * @param {string|number} label - The index label to set
   * @param {*} value - The value to set at the label
   * @returns {Series} The Series instance (for chaining)
   *
   * @throws {ValidationError} If `label` is an array
   * @throws {IndexError} If the label does not exist in the index
   *
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * series.at.set('b', 99);
   * console.log(series.at.get('b')); // 99
   */
  set(label, value) {
    if (Array.isArray(label)) {
      throw new ValidationError('at.set accepts only scalar labels, not arrays', {
        operation: 'Series.at.set',
        value: label,
        expected: 'scalar'
      });
    }
    const idx = this._series._index.indexOf(label);
    if (idx === -1) {
      throw new IndexError(`Label '${label}' not found in index`, {
        operation: 'Series.at.set',
        value: label,
        expected: `one of ${JSON.stringify(this._series._index)}`
      });
    }
    this._series._data[idx] = value;
    this._series[idx] = value; // keep Array-extending storage in sync
    return this._series;
  }
}

/**
 * SeriesIatIndexer class - Fast scalar position-based accessor for Series.
 * Accessed via the Series.iat property, this class offers pandas-like fast
 * scalar access by integer position. Unlike ILocIndexer, it rejects array/slice
 * arguments and only supports a single integer position for both get and set.
 * Mirrors pandas `s.iat[pos]` semantics.
 *
 * @class SeriesIatIndexer
 *
 * @example
 * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
 * const value = series.iat.get(1); // 20
 * series.iat.set(1, 99); // Sets value at position 1 to 99 in place
 */
class SeriesIatIndexer {
  /**
   * Creates a new SeriesIatIndexer instance.
   *
   * @param {Series} series - The Series instance to operate on
   *
   * @example
   * // Typically accessed via series.iat, not instantiated directly
   * const iatIndexer = new SeriesIatIndexer(series);
   */
  constructor(series) {
    this._series = series;
  }

  /**
   * Validates that `position` is a single, in-range integer position.
   * Used internally by `get` and `set`. Rejects arrays, non-integer numeric
   * values, non-number types, and positions outside `[0, length - 1]`.
   *
   * @param {number} position - The integer position to validate
   * @param {string} op - Operation tag for error context ('Series.iat.get' or 'Series.iat.set')
   * @returns {void}
   *
   * @throws {ValidationError} If `position` is an array
   * @throws {ValidationError} If `position` is not an integer (including non-number types)
   * @throws {IndexError} If `position` is out of range for the Series
   * @private
   */
  _validatePos(position, op) {
    if (Array.isArray(position)) {
      throw new ValidationError('iat accepts only a scalar integer position, not arrays', {
        operation: op,
        value: position,
        expected: 'integer'
      });
    }
    if (!Number.isInteger(position)) {
      throw new ValidationError('iat position must be an integer', {
        operation: op,
        value: position,
        expected: 'integer'
      });
    }
    if (position < 0 || position >= this._series._data.length) {
      throw new IndexError(`Position ${position} is out of bounds for Series of length ${this._series._data.length}`, {
        operation: op,
        value: position,
        expected: `integer between 0 and ${this._series._data.length - 1}`
      });
    }
  }

  /**
   * Gets the scalar value at the specified integer position.
   * Only accepts a single integer position; arrays are rejected.
   *
   * @param {number} position - The integer position to look up
   * @returns {*} The value at the given position
   *
   * @throws {ValidationError} If `position` is an array or not an integer
   * @throws {IndexError} If `position` is out of range for the Series
   *
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * console.log(series.iat.get(1)); // 20
   */
  get(position) {
    this._validatePos(position, 'Series.iat.get');
    return this._series._data[position];
  }

  /**
   * Sets the scalar value at the specified integer position in place.
   * Only accepts a single integer position; arrays are rejected. Returns the
   * underlying Series to allow chaining.
   *
   * @param {number} position - The integer position to set
   * @param {*} value - The value to set at the position
   * @returns {Series} The Series instance (for chaining)
   *
   * @throws {ValidationError} If `position` is an array or not an integer
   * @throws {IndexError} If `position` is out of range for the Series
   *
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * series.iat.set(1, 99);
   * console.log(series.iat.get(1)); // 99
   */
  set(position, value) {
    this._validatePos(position, 'Series.iat.set');
    this._series._data[position] = value;
    this._series[position] = value; // keep Array-extending storage in sync
    return this._series;
  }
}

/**
 * StringAccessor class - Provides string manipulation methods for Series.
 * Accessed via the Series.str property, this class offers pandas-like string operations
 * that return new Series with transformed values while preserving null values.
 * 
 * @class StringAccessor
 * 
 * @example
 * const series = new Series(['hello', 'WORLD', null, 'Test']);
 * const upper = series.str.upper(); // ['HELLO', 'WORLD', null, 'TEST']
 * const contains = series.str.contains('o'); // [true, true, null, false]
 */
class StringAccessor {
  /**
   * Creates a new StringAccessor instance.
   * 
   * @param {Series} series - The Series instance to operate on
   * 
   * @example
   * // Typically accessed via series.str, not instantiated directly
   * const accessor = new StringAccessor(series);
   */
  constructor(series) {
    this._series = series;
  }

  /**
   * Convert all strings to uppercase.
   * 
   * @returns {Series} A new Series with uppercase strings
   * 
   * @example
   * const series = new Series(['hello', 'world', null]);
   * const result = series.str.upper();
   * console.log(result); // ['HELLO', 'WORLD', null]
   */
  upper() {
    const data = this._series._data.map(val => 
      isNull(val) ? val : String(val).toUpperCase()
    );
    return new Series(data, { 
      index: this._series._index, 
      name: this._series._name 
    });
  }

  /**
   * Convert all strings to lowercase.
   * 
   * @returns {Series} A new Series with lowercase strings
   * 
   * @example
   * const series = new Series(['HELLO', 'WORLD', null]);
   * const result = series.str.lower();
   * console.log(result); // ['hello', 'world', null]
   */
  lower() {
    const data = this._series._data.map(val => 
      isNull(val) ? val : String(val).toLowerCase()
    );
    return new Series(data, { 
      index: this._series._index, 
      name: this._series._name 
    });
  }

  /**
   * Check if strings contain a substring.
   * 
   * @param {string} substring - The substring to search for
   * @param {boolean} [caseSensitive=true] - Whether the search is case-sensitive
   * @returns {Series} A new Series with boolean values indicating if substring is present
   * 
   * @example
   * const series = new Series(['hello', 'world', null, 'HELLO']);
   * const result = series.str.contains('ell');
   * console.log(result); // [true, false, null, false]
   * 
   * @example
   * const result = series.str.contains('ell', false);
   * console.log(result); // [true, false, null, true]
   */
  contains(substring, caseSensitive = true) {
    const data = this._series._data.map(val => {
      if (isNull(val)) return val;
      const str = String(val);
      const sub = String(substring);
      if (caseSensitive) {
        return str.includes(sub);
      } else {
        return str.toLowerCase().includes(sub.toLowerCase());
      }
    });
    return new Series(data, { 
      index: this._series._index, 
      name: this._series._name 
    });
  }

  /**
   * Replace occurrences of pattern with replacement string.
   * 
   * @param {string|RegExp} pattern - The pattern to search for (string or regex)
   * @param {string} replacement - The replacement string
   * @returns {Series} A new Series with replaced strings
   * 
   * @example
   * const series = new Series(['hello world', 'hello there', null]);
   * const result = series.str.replace('hello', 'hi');
   * console.log(result); // ['hi world', 'hi there', null]
   * 
   * @example
   * const result = series.str.replace(/hello/g, 'hi');
   * console.log(result); // ['hi world', 'hi there', null]
   */
  replace(pattern, replacement) {
    const data = this._series._data.map(val => {
      if (isNull(val)) return val;
      return String(val).replace(pattern, String(replacement));
    });
    return new Series(data, { 
      index: this._series._index, 
      name: this._series._name 
    });
  }

  /**
   * Split strings by separator and return Series of arrays.
   * 
   * @param {string|RegExp} separator - The separator to split on
   * @returns {Series} A new Series with arrays of split strings
   * 
   * @example
   * const series = new Series(['a,b,c', 'd,e,f', null]);
   * const result = series.str.split(',');
   * console.log(result); // [['a','b','c'], ['d','e','f'], null]
   */
  split(separator) {
    const data = this._series._data.map(val => {
      if (isNull(val)) return val;
      return String(val).split(separator);
    });
    return new Series(data, { 
      index: this._series._index, 
      name: this._series._name 
    });
  }

  /**
   * Remove leading and trailing whitespace from strings.
   * 
   * @returns {Series} A new Series with trimmed strings
   * 
   * @example
   * const series = new Series(['  hello  ', '  world', null, 'test  ']);
   * const result = series.str.strip();
   * console.log(result); // ['hello', 'world', null, 'test']
   */
  strip() {
    const data = this._series._data.map(val => 
      isNull(val) ? val : String(val).trim()
    );
    return new Series(data, { 
      index: this._series._index, 
      name: this._series._name 
    });
  }

  /**
   * Check if strings start with a prefix.
   * 
   * @param {string} prefix - The prefix to check for
   * @returns {Series} A new Series with boolean values
   * 
   * @example
   * const series = new Series(['hello', 'world', null, 'help']);
   * const result = series.str.startswith('hel');
   * console.log(result); // [true, false, null, true]
   */
  startswith(prefix) {
    const data = this._series._data.map(val => {
      if (isNull(val)) return val;
      return String(val).startsWith(String(prefix));
    });
    return new Series(data, { 
      index: this._series._index, 
      name: this._series._name 
    });
  }

  /**
   * Check if strings end with a suffix.
   * 
   * @param {string} suffix - The suffix to check for
   * @returns {Series} A new Series with boolean values
   * 
   * @example
   * const series = new Series(['hello', 'world', null, 'test']);
   * const result = series.str.endswith('ld');
   * console.log(result); // [false, true, null, false]
   */
  endswith(suffix) {
    const data = this._series._data.map(val => {
      if (isNull(val)) return val;
      return String(val).endsWith(String(suffix));
    });
    return new Series(data, { 
      index: this._series._index, 
      name: this._series._name 
    });
  }

  /**
   * Get the length of each string.
   * 
   * @returns {Series} A new Series with string lengths
   * 
   * @example
   * const series = new Series(['hello', 'world', null, 'test']);
   * const result = series.str.len();
   * console.log(result); // [5, 5, null, 4]
   */
  len() {
    const data = this._series._data.map(val => {
      if (isNull(val)) return val;
      return String(val).length;
    });
    return new Series(data, { 
      index: this._series._index, 
      name: this._series._name 
    });
  }
}

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
   * Gets a StringAccessor for string operations on the Series.
   * Provides pandas-like string manipulation methods that return new Series.
   * 
   * @type {StringAccessor}
   * @readonly
   * 
   * @example
   * const series = new Series(['hello', 'WORLD', null]);
   * const upper = series.str.upper();
   * console.log(upper); // ['HELLO', 'WORLD', null]
   * 
   * @example
   * const contains = series.str.contains('o');
   * console.log(contains); // [true, true, null]
   */
  get str() {
    return new StringAccessor(this);
  }

  /**
   * Gets a LocIndexer for label-based indexing on the Series.
   * Provides pandas-like label-based indexing that allows getting and setting
   * values by index labels.
   * 
   * @type {LocIndexer}
   * @readonly
   * 
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * const value = series.loc.get('b'); // 20
   * 
   * @example
   * const subset = series.loc.get(['a', 'c']);
   * console.log(subset); // Series with values [10, 30]
   * 
   * @example
   * series.loc.set('b', 25);
   * console.log(series.get('b')); // 25
   */
  get loc() {
    return new LocIndexer(this);
  }

  /**
   * Gets an ILocIndexer for position-based indexing on the Series.
   * Provides pandas-like integer-based indexing that allows getting and setting
   * values by integer positions.
   * 
   * @type {ILocIndexer}
   * @readonly
   * 
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * const value = series.iloc.get(1); // 20
   * 
   * @example
   * const subset = series.iloc.get([0, 2]);
   * console.log(subset); // Series with values [10, 30]
   * 
   * @example
   * series.iloc.set(1, 25);
   * console.log(series.iloc.get(1)); // 25
   */
  get iloc() {
    return new ILocIndexer(this);
  }

  /**
   * Gets a SeriesAtIndexer for fast scalar label-based access on the Series.
   * Provides pandas-like `s.at[label]` semantics - get/set a single value by
   * its index label. Rejects array/slice arguments.
   *
   * @type {SeriesAtIndexer}
   * @readonly
   *
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * const value = series.at.get('b'); // 20
   *
   * @example
   * series.at.set('b', 99);
   * console.log(series.at.get('b')); // 99
   */
  get at() {
    return new SeriesAtIndexer(this);
  }

  /**
   * Gets a SeriesIatIndexer for fast scalar position-based access on the Series.
   * Provides pandas-like `s.iat[pos]` semantics - get/set a single value by
   * its integer position. Rejects array/slice arguments and non-integer values.
   *
   * @type {SeriesIatIndexer}
   * @readonly
   *
   * @example
   * const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
   * const value = series.iat.get(1); // 20
   *
   * @example
   * series.iat.set(1, 99);
   * console.log(series.iat.get(1)); // 99
   */
  get iat() {
    return new SeriesIatIndexer(this);
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

  /**
   * Element-wise equality comparison (==).
   * Compares each element in the Series with a scalar value or corresponding elements in another Series.
   *
   * @param {*|Series} other - Value or Series to compare with
   * @returns {Series} A new Series of boolean values indicating equality
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.eq(3);
   * // Returns: Series([false, false, true, false, false])
   *
   * @example
   * const s1 = new Series([1, 2, 3]);
   * const s2 = new Series([1, 0, 3]);
   * s1.eq(s2);
   * // Returns: Series([true, false, true])
   */
  eq(other) {
    if (other instanceof Series) {
      if (this._data.length !== other._data.length) {
        throw new OperationError('Series must have the same length for comparison');
      }
      const resultData = this._data.map((val, i) => val === other._data[i]);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    } else {
      const resultData = this._data.map(val => val === other);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    }
  }

  /**
   * Element-wise not equal comparison (!=).
   * Compares each element in the Series with a scalar value or corresponding elements in another Series.
   *
   * @param {*|Series} other - Value or Series to compare with
   * @returns {Series} A new Series of boolean values indicating inequality
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.ne(3);
   * // Returns: Series([true, true, false, true, true])
   *
   * @example
   * const s1 = new Series([1, 2, 3]);
   * const s2 = new Series([1, 0, 3]);
   * s1.ne(s2);
   * // Returns: Series([false, true, false])
   */
  ne(other) {
    if (other instanceof Series) {
      if (this._data.length !== other._data.length) {
        throw new OperationError('Series must have the same length for comparison');
      }
      const resultData = this._data.map((val, i) => val !== other._data[i]);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    } else {
      const resultData = this._data.map(val => val !== other);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    }
  }

  /**
   * Element-wise greater than comparison (>).
   * Compares each element in the Series with a scalar value or corresponding elements in another Series.
   *
   * @param {*|Series} other - Value or Series to compare with
   * @returns {Series} A new Series of boolean values indicating greater than
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.gt(3);
   * // Returns: Series([false, false, false, true, true])
   *
   * @example
   * const s1 = new Series([1, 2, 3]);
   * const s2 = new Series([0, 2, 4]);
   * s1.gt(s2);
   * // Returns: Series([true, false, false])
   */
  gt(other) {
    if (other instanceof Series) {
      if (this._data.length !== other._data.length) {
        throw new OperationError('Series must have the same length for comparison');
      }
      const resultData = this._data.map((val, i) => val > other._data[i]);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    } else {
      const resultData = this._data.map(val => val > other);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    }
  }

  /**
   * Element-wise less than comparison (<).
   * Compares each element in the Series with a scalar value or corresponding elements in another Series.
   *
   * @param {*|Series} other - Value or Series to compare with
   * @returns {Series} A new Series of boolean values indicating less than
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.lt(3);
   * // Returns: Series([true, true, false, false, false])
   *
   * @example
   * const s1 = new Series([1, 2, 3]);
   * const s2 = new Series([0, 2, 4]);
   * s1.lt(s2);
   * // Returns: Series([false, false, true])
   */
  lt(other) {
    if (other instanceof Series) {
      if (this._data.length !== other._data.length) {
        throw new OperationError('Series must have the same length for comparison');
      }
      const resultData = this._data.map((val, i) => val < other._data[i]);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    } else {
      const resultData = this._data.map(val => val < other);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    }
  }

  /**
   * Element-wise greater than or equal comparison (>=).
   * Compares each element in the Series with a scalar value or corresponding elements in another Series.
   *
   * @param {*|Series} other - Value or Series to compare with
   * @returns {Series} A new Series of boolean values indicating greater than or equal
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.ge(3);
   * // Returns: Series([false, false, true, true, true])
   *
   * @example
   * const s1 = new Series([1, 2, 3]);
   * const s2 = new Series([0, 2, 4]);
   * s1.ge(s2);
   * // Returns: Series([true, true, false])
   */
  ge(other) {
    if (other instanceof Series) {
      if (this._data.length !== other._data.length) {
        throw new OperationError('Series must have the same length for comparison');
      }
      const resultData = this._data.map((val, i) => val >= other._data[i]);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    } else {
      const resultData = this._data.map(val => val >= other);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    }
  }

  /**
   * Element-wise less than or equal comparison (<=).
   * Compares each element in the Series with a scalar value or corresponding elements in another Series.
   *
   * @param {*|Series} other - Value or Series to compare with
   * @returns {Series} A new Series of boolean values indicating less than or equal
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.le(3);
   * // Returns: Series([true, true, true, false, false])
   *
   * @example
   * const s1 = new Series([1, 2, 3]);
   * const s2 = new Series([0, 2, 4]);
   * s1.le(s2);
   * // Returns: Series([false, true, true])
   */
  le(other) {
    if (other instanceof Series) {
      if (this._data.length !== other._data.length) {
        throw new OperationError('Series must have the same length for comparison');
      }
      const resultData = this._data.map((val, i) => val <= other._data[i]);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    } else {
      const resultData = this._data.map(val => val <= other);
      return new Series(resultData, {
        index: this._index,
        name: this._name
      });
    }
  }

  /**
   * Check if values are between left and right bounds.
   * Returns a boolean Series indicating whether each element falls within the specified range.
   *
   * @param {number} left - Lower bound value
   * @param {number} right - Upper bound value
   * @param {string} [inclusive='both'] - Include boundaries. Options: 'both', 'neither', 'left', 'right'
   * @returns {Series} A new Series of boolean values indicating if values are within bounds
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.between(2, 4);
   * // Returns: Series([false, true, true, true, false])
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.between(2, 4, 'neither');
   * // Returns: Series([false, false, true, false, false])
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.between(2, 4, 'left');
   * // Returns: Series([false, true, true, false, false])
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.between(2, 4, 'right');
   * // Returns: Series([false, false, true, true, false])
   */
  between(left, right, inclusive = 'both') {
    const validInclusive = ['both', 'neither', 'left', 'right'];
    if (!validInclusive.includes(inclusive)) {
      throw new OperationError(
        `Invalid value for 'inclusive' parameter: ${inclusive}. Must be one of: ${validInclusive.join(', ')}`
      );
    }

    let resultData;

    if (inclusive === 'both') {
      resultData = this._data.map(val => val >= left && val <= right);
    } else if (inclusive === 'neither') {
      resultData = this._data.map(val => val > left && val < right);
    } else if (inclusive === 'left') {
      resultData = this._data.map(val => val >= left && val < right);
    } else if (inclusive === 'right') {
      resultData = this._data.map(val => val > left && val <= right);
    }

    return new Series(resultData, {
      index: this._index,
      name: this._name
    });
  }

  /**
   * Returns a Series with cumulative sum of values.
   *
   * Computes the cumulative sum of the Series values, propagating the sum
   * at each position. Null values are skipped in the calculation but preserved
   * in the output at their original positions.
   *
   * @returns {Series} A new Series with cumulative sum values
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.cumsum();
   * // Returns: Series([1, 3, 6, 10, 15])
   *
   * @example
   * // With null values
   * const s = new Series([1, null, 3, 4, null, 6]);
   * s.cumsum();
   * // Returns: Series([1, null, 4, 8, null, 14])
   *
   * @example
   * // With mixed types
   * const s = new Series([1, '2', 3, '4']);
   * s.cumsum();
   * // Returns: Series([1, 3, 6, 10])
   */
  cumsum() {
    let cumulative = 0;
    const resultData = this._data.map(val => {
      if (isNull(val)) {
        return null;
      }
      const numVal = toNumeric(val);
      if (isNull(numVal)) {
        return null;
      }
      cumulative += numVal;
      return cumulative;
    });

    return new Series(resultData, {
      index: this._index,
      name: this._name
    });
  }

  /**
   * Returns a Series with cumulative product of values.
   *
   * Computes the cumulative product of the Series values, propagating the product
   * at each position. Null values are skipped in the calculation but preserved
   * in the output at their original positions.
   *
   * @returns {Series} A new Series with cumulative product values
   *
   * @example
   * const s = new Series([1, 2, 3, 4, 5]);
   * s.cumprod();
   * // Returns: Series([1, 2, 6, 24, 120])
   *
   * @example
   * // With null values
   * const s = new Series([2, null, 3, 4, null, 5]);
   * s.cumprod();
   * // Returns: Series([2, null, 6, 24, null, 120])
   *
   * @example
   * // With zeros
   * const s = new Series([1, 2, 0, 4, 5]);
   * s.cumprod();
   * // Returns: Series([1, 2, 0, 0, 0])
   */
  cumprod() {
    let cumulative = 1;
    const resultData = this._data.map(val => {
      if (isNull(val)) {
        return null;
      }
      const numVal = toNumeric(val);
      if (isNull(numVal)) {
        return null;
      }
      cumulative *= numVal;
      return cumulative;
    });

    return new Series(resultData, {
      index: this._index,
      name: this._name
    });
  }

  /**
   * Returns a Series with cumulative maximum of values.
   *
   * Computes the cumulative maximum of the Series values, propagating the maximum
   * value seen so far at each position. Null values are skipped in the calculation
   * but preserved in the output at their original positions.
   *
   * @returns {Series} A new Series with cumulative maximum values
   *
   * @example
   * const s = new Series([3, 1, 4, 1, 5, 9, 2]);
   * s.cummax();
   * // Returns: Series([3, 3, 4, 4, 5, 9, 9])
   *
   * @example
   * // With null values
   * const s = new Series([3, null, 4, 1, null, 9]);
   * s.cummax();
   * // Returns: Series([3, null, 4, 4, null, 9])
   *
   * @example
   * // With negative numbers
   * const s = new Series([-5, -2, -8, -1, -3]);
   * s.cummax();
   * // Returns: Series([-5, -2, -2, -1, -1])
   */
  cummax() {
    let cumulative = -Infinity;
    const resultData = this._data.map(val => {
      if (isNull(val)) {
        return null;
      }
      const numVal = toNumeric(val);
      if (isNull(numVal)) {
        return null;
      }
      cumulative = Math.max(cumulative, numVal);
      return cumulative;
    });

    return new Series(resultData, {
      index: this._index,
      name: this._name
    });
  }

  /**
   * Returns a Series with cumulative minimum of values.
   *
   * Computes the cumulative minimum of the Series values, propagating the minimum
   * value seen so far at each position. Null values are skipped in the calculation
   * but preserved in the output at their original positions.
   *
   * @returns {Series} A new Series with cumulative minimum values
   *
   * @example
   * const s = new Series([3, 1, 4, 1, 5, 9, 2]);
   * s.cummin();
   * // Returns: Series([3, 1, 1, 1, 1, 1, 1])
   *
   * @example
   * // With null values
   * const s = new Series([3, null, 1, 4, null, 0]);
   * s.cummin();
   * // Returns: Series([3, null, 1, 1, null, 0])
   *
   * @example
   * // With negative numbers
   * const s = new Series([-5, -2, -8, -1, -3]);
   * s.cummin();
   * // Returns: Series([-5, -5, -8, -8, -8])
   */
  cummin() {
    let cumulative = Infinity;
    const resultData = this._data.map(val => {
      if (isNull(val)) {
        return null;
      }
      const numVal = toNumeric(val);
      if (isNull(numVal)) {
        return null;
      }
      cumulative = Math.min(cumulative, numVal);
      return cumulative;
    });

    return new Series(resultData, {
      index: this._index,
      name: this._name
    });
  }

  /**
   * Create a rolling window for computing rolling statistics.
   * 
   * @param {number} window - The size of the rolling window
   * @returns {RollingWindow} A RollingWindow instance for computing rolling statistics
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const rollingMean = series.rolling(3).mean();
   * // Returns Series: [null, null, 2, 3, 4]
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const rollingSum = series.rolling(2).sum();
   * // Returns Series: [null, 3, 5, 7, 9]
   */
  rolling(window) {
    return new RollingWindow(this, window);
  }

  /**
   * Create an expanding window for computing cumulative statistics.
   * 
   * @returns {ExpandingWindow} An ExpandingWindow instance for computing expanding statistics
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const expandingMean = series.expanding().mean();
   * // Returns Series: [1, 1.5, 2, 2.5, 3]
   * 
   * @example
   * const series = new Series([1, 2, 3, 4, 5]);
   * const expandingSum = series.expanding().sum();
   * // Returns Series: [1, 3, 6, 10, 15]
   */
  expanding() {
    return new ExpandingWindow(this);
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

// camelCase aliases for snake_case methods (kept for backward compatibility).
// Canonical: camelCase. Aliases: snake_case. See README "Naming convention".
Series.prototype.sortValues = Series.prototype.sort_values;
Series.prototype.sortIndex = Series.prototype.sort_index;
Series.prototype.valueCounts = Series.prototype.value_counts;
Series.prototype.dropDuplicates = Series.prototype.drop_duplicates;

module.exports = Series;
module.exports.createSeries = createSeries;
