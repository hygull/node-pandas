/**
 * Type Detection Utilities
 * 
 * Provides comprehensive type detection and inference for data values,
 * arrays, and DataFrame columns. Supports detection of numeric, string,
 * boolean, date, and null types, with special handling for numeric strings.
 * 
 * @module typeDetection
 */

/**
 * Detects if a value is null or undefined
 * 
 * @param {*} value - The value to check
 * @returns {boolean} True if value is null or undefined
 * 
 * @example
 * isNull(null) // true
 * isNull(undefined) // true
 * isNull(0) // false
 * isNull('') // false
 */
function isNull(value) {
  return value === null || value === undefined;
}

/**
 * Detects if a value is a boolean
 * 
 * @param {*} value - The value to check
 * @returns {boolean} True if value is a boolean
 * 
 * @example
 * isBoolean(true) // true
 * isBoolean(false) // true
 * isBoolean(1) // false
 * isBoolean('true') // false
 */
function isBoolean(value) {
  return typeof value === 'boolean';
}

/**
 * Detects if a value is a numeric string (can be parsed as a number)
 * 
 * @param {*} value - The value to check
 * @returns {boolean} True if value is a string that represents a number
 * 
 * @example
 * isNumericString('123') // true
 * isNumericString('123.45') // true
 * isNumericString('-456') // true
 * isNumericString('abc') // false
 * isNumericString('') // false
 */
function isNumericString(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Detects if a value is a number (including numeric strings)
 * 
 * @param {*} value - The value to check
 * @returns {boolean} True if value is a number or numeric string
 * 
 * @example
 * isNumeric(123) // true
 * isNumeric(123.45) // true
 * isNumeric('123') // true
 * isNumeric('abc') // false
 * isNumeric(null) // false
 */
function isNumeric(value) {
  if (isNull(value)) {
    return false;
  }
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }
  return isNumericString(value);
}

/**
 * Detects if a value is a string
 * 
 * @param {*} value - The value to check
 * @returns {boolean} True if value is a string
 * 
 * @example
 * isString('hello') // true
 * isString('') // true
 * isString(123) // false
 * isString(null) // false
 */
function isString(value) {
  return typeof value === 'string';
}

/**
 * Detects if a value is a Date object
 * 
 * @param {*} value - The value to check
 * @returns {boolean} True if value is a Date object
 * 
 * @example
 * isDate(new Date()) // true
 * isDate('2023-01-01') // false
 * isDate(1234567890) // false
 */
function isDate(value) {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Detects if a value is a date string (ISO 8601 format)
 * 
 * @param {*} value - The value to check
 * @returns {boolean} True if value is a string in ISO 8601 date format
 * 
 * @example
 * isDateString('2023-01-01') // true
 * isDateString('2023-01-01T12:00:00Z') // true
 * isDateString('01/01/2023') // false
 * isDateString('not a date') // false
 */
function isDateString(value) {
  if (!isString(value)) {
    return false;
  }
  // ISO 8601 date format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss[.sss]Z
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  if (!isoDateRegex.test(value)) {
    return false;
  }
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Detects the type of a single value
 * 
 * Returns one of: 'null', 'boolean', 'numeric', 'string', 'date', 'unknown'
 * 
 * @param {*} value - The value to detect
 * @returns {string} The detected type
 * 
 * @example
 * detectType(null) // 'null'
 * detectType(true) // 'boolean'
 * detectType(123) // 'numeric'
 * detectType('hello') // 'string'
 * detectType(new Date()) // 'date'
 * detectType({}) // 'unknown'
 */
function detectType(value) {
  if (isNull(value)) {
    return 'null';
  }
  if (isBoolean(value)) {
    return 'boolean';
  }
  if (isDate(value)) {
    return 'date';
  }
  if (isNumeric(value)) {
    return 'numeric';
  }
  if (isString(value)) {
    return 'string';
  }
  return 'unknown';
}

/**
 * Infers the dominant type of an array of values
 * 
 * Analyzes all values in the array and returns the most common type.
 * Null values are ignored in type inference.
 * 
 * @param {Array} array - The array to analyze
 * @returns {string} The inferred type: 'null', 'boolean', 'numeric', 'string', 'date', or 'mixed'
 * 
 * @example
 * inferArrayType([1, 2, 3]) // 'numeric'
 * inferArrayType(['a', 'b', 'c']) // 'string'
 * inferArrayType([1, 'a', true]) // 'mixed'
 * inferArrayType([null, null, null]) // 'null'
 * inferArrayType([]) // 'null'
 */
function inferArrayType(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return 'null';
  }

  const typeCounts = {};
  let nonNullCount = 0;

  for (const value of array) {
    const type = detectType(value);
    if (type !== 'null') {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      nonNullCount++;
    }
  }

  if (nonNullCount === 0) {
    return 'null';
  }

  // If all non-null values are the same type, return that type
  if (Object.keys(typeCounts).length === 1) {
    return Object.keys(typeCounts)[0];
  }

  // If there are multiple types, return 'mixed'
  return 'mixed';
}

/**
 * Infers the type of a DataFrame column
 * 
 * Analyzes all values in a column and returns the inferred type.
 * This is a convenience wrapper around inferArrayType.
 * 
 * @param {Array} column - The column data (array of values)
 * @returns {string} The inferred type
 * 
 * @example
 * inferColumnType([1, 2, 3, null]) // 'numeric'
 * inferColumnType(['a', 'b', null]) // 'string'
 */
function inferColumnType(column) {
  return inferArrayType(column);
}

/**
 * Infers types for all columns in a DataFrame
 * 
 * @param {Array<Array>} data - 2D array where each inner array is a column
 * @param {Array<string>} [columnNames] - Optional column names for reference
 * @returns {Object} Object mapping column names/indices to inferred types
 * 
 * @example
 * inferDataFrameTypes([[1, 2, 3], ['a', 'b', 'c']])
 * // { '0': 'numeric', '1': 'string' }
 * 
 * inferDataFrameTypes([[1, 2, 3], ['a', 'b', 'c']], ['id', 'name'])
 * // { id: 'numeric', name: 'string' }
 */
function inferDataFrameTypes(data, columnNames = null) {
  const types = {};

  if (!Array.isArray(data) || data.length === 0) {
    return types;
  }

  // Handle row-based data (array of objects or arrays)
  if (Array.isArray(data[0]) && !Array.isArray(data[0][0])) {
    // Row-based format: [[row1], [row2], ...]
    const numCols = data[0].length;
    for (let colIndex = 0; colIndex < numCols; colIndex++) {
      const column = data.map(row => row[colIndex]);
      const colName = columnNames ? columnNames[colIndex] : String(colIndex);
      types[colName] = inferColumnType(column);
    }
  } else if (Array.isArray(data[0])) {
    // Column-based format: [[col1], [col2], ...]
    for (let colIndex = 0; colIndex < data.length; colIndex++) {
      const colName = columnNames ? columnNames[colIndex] : String(colIndex);
      types[colName] = inferColumnType(data[colIndex]);
    }
  }

  return types;
}

/**
 * Converts a value to its numeric representation if possible
 * 
 * @param {*} value - The value to convert
 * @returns {number|null} The numeric value, or null if conversion fails
 * 
 * @example
 * toNumeric(123) // 123
 * toNumeric('456') // 456
 * toNumeric('123.45') // 123.45
 * toNumeric('abc') // null
 * toNumeric(null) // null
 */
function toNumeric(value) {
  if (isNull(value)) {
    return null;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  if (isNumericString(value)) {
    return parseFloat(value);
  }
  return null;
}

/**
 * Converts a value to its string representation
 * 
 * @param {*} value - The value to convert
 * @returns {string|null} The string value, or null if value is null/undefined
 * 
 * @example
 * toString(123) // '123'
 * toString('hello') // 'hello'
 * toString(true) // 'true'
 * toString(null) // null
 */
function toString(value) {
  if (isNull(value)) {
    return null;
  }
  return String(value);
}

module.exports = {
  isNull,
  isBoolean,
  isNumericString,
  isNumeric,
  isString,
  isDate,
  isDateString,
  detectType,
  inferArrayType,
  inferColumnType,
  inferDataFrameTypes,
  toNumeric,
  toString
};
