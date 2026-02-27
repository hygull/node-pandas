/**
 * Data Validation Utilities
 * 
 * Provides comprehensive validation for DataFrame structure, column names,
 * data integrity, and type compatibility. Includes parameter validation
 * helpers for operations and type checking utilities.
 * 
 * @module validation
 */

const typeDetection = require('./typeDetection');

/**
 * Validates that a value is not null or undefined
 * 
 * @param {*} value - The value to validate
 * @param {string} [paramName='value'] - The parameter name for error messages
 * @returns {boolean} True if value is valid
 * @throws {Error} If value is null or undefined
 * 
 * @example
 * validateNotNull(123, 'count') // true
 * validateNotNull(null, 'count') // throws Error
 */
function validateNotNull(value, paramName = 'value') {
  if (typeDetection.isNull(value)) {
    throw new Error(`${paramName} cannot be null or undefined`);
  }
  return true;
}

/**
 * Validates that a value is a string
 * 
 * @param {*} value - The value to validate
 * @param {string} [paramName='value'] - The parameter name for error messages
 * @returns {boolean} True if value is a string
 * @throws {Error} If value is not a string
 * 
 * @example
 * validateString('hello', 'name') // true
 * validateString(123, 'name') // throws Error
 */
function validateString(value, paramName = 'value') {
  if (!typeDetection.isString(value)) {
    throw new Error(`${paramName} must be a string, got ${typeof value}`);
  }
  return true;
}

/**
 * Validates that a value is an array
 * 
 * @param {*} value - The value to validate
 * @param {string} [paramName='value'] - The parameter name for error messages
 * @returns {boolean} True if value is an array
 * @throws {Error} If value is not an array
 * 
 * @example
 * validateArray([1, 2, 3], 'data') // true
 * validateArray('not an array', 'data') // throws Error
 */
function validateArray(value, paramName = 'value') {
  if (!Array.isArray(value)) {
    throw new Error(`${paramName} must be an array, got ${typeof value}`);
  }
  return true;
}

/**
 * Validates that an array is not empty
 * 
 * @param {Array} array - The array to validate
 * @param {string} [paramName='array'] - The parameter name for error messages
 * @returns {boolean} True if array is not empty
 * @throws {Error} If array is empty
 * 
 * @example
 * validateNotEmpty([1, 2, 3], 'data') // true
 * validateNotEmpty([], 'data') // throws Error
 */
function validateNotEmpty(array, paramName = 'array') {
  validateArray(array, paramName);
  if (array.length === 0) {
    throw new Error(`${paramName} cannot be empty`);
  }
  return true;
}

/**
 * Validates that a value is a number
 * 
 * @param {*} value - The value to validate
 * @param {string} [paramName='value'] - The parameter name for error messages
 * @returns {boolean} True if value is a number
 * @throws {Error} If value is not a number
 * 
 * @example
 * validateNumber(123, 'count') // true
 * validateNumber('123', 'count') // throws Error
 */
function validateNumber(value, paramName = 'value') {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${paramName} must be a number, got ${typeof value}`);
  }
  return true;
}

/**
 * Validates that a value is a function
 * 
 * @param {*} value - The value to validate
 * @param {string} [paramName='value'] - The parameter name for error messages
 * @returns {boolean} True if value is a function
 * @throws {Error} If value is not a function
 * 
 * @example
 * validateFunction((x) => x * 2, 'transform') // true
 * validateFunction('not a function', 'transform') // throws Error
 */
function validateFunction(value, paramName = 'value') {
  if (typeof value !== 'function') {
    throw new Error(`${paramName} must be a function, got ${typeof value}`);
  }
  return true;
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param {*} value - The value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} [paramName='value'] - The parameter name for error messages
 * @returns {boolean} True if value is in allowedValues
 * @throws {Error} If value is not in allowedValues
 * 
 * @example
 * validateOneOf('inner', ['inner', 'left', 'right', 'outer'], 'joinType') // true
 * validateOneOf('invalid', ['inner', 'left'], 'joinType') // throws Error
 */
function validateOneOf(value, allowedValues, paramName = 'value') {
  if (!allowedValues.includes(value)) {
    throw new Error(
      `${paramName} must be one of [${allowedValues.join(', ')}], got ${value}`
    );
  }
  return true;
}

/**
 * Validates DataFrame structure (2D array with consistent row lengths)
 * 
 * @param {Array<Array>} data - The data to validate
 * @returns {boolean} True if data is a valid DataFrame structure
 * @throws {Error} If data structure is invalid
 * 
 * @example
 * validateDataFrameStructure([[1, 2], [3, 4]]) // true
 * validateDataFrameStructure([[1, 2], [3]]) // throws Error (inconsistent row length)
 * validateDataFrameStructure('not an array') // throws Error
 */
function validateDataFrameStructure(data) {
  validateArray(data, 'data');

  if (data.length === 0) {
    return true;
  }

  // Check if first element is an array (row-based format)
  if (!Array.isArray(data[0])) {
    throw new Error('DataFrame data must be a 2D array (array of arrays)');
  }

  const expectedLength = data[0].length;

  // Validate all rows have the same length
  for (let i = 1; i < data.length; i++) {
    if (!Array.isArray(data[i])) {
      throw new Error(`Row ${i} is not an array`);
    }
    if (data[i].length !== expectedLength) {
      throw new Error(
        `Row ${i} has length ${data[i].length}, expected ${expectedLength}`
      );
    }
  }

  return true;
}

/**
 * Validates column names array
 * 
 * @param {Array<string>} columnNames - The column names to validate
 * @param {number} [expectedLength] - Expected number of columns
 * @returns {boolean} True if column names are valid
 * @throws {Error} If column names are invalid
 * 
 * @example
 * validateColumnNames(['id', 'name', 'age']) // true
 * validateColumnNames(['id', 'name'], 3) // throws Error (length mismatch)
 * validateColumnNames(['id', 'id']) // throws Error (duplicate names)
 */
function validateColumnNames(columnNames, expectedLength = null) {
  validateArray(columnNames, 'columnNames');

  // Validate each column name is a string
  for (let i = 0; i < columnNames.length; i++) {
    if (!typeDetection.isString(columnNames[i])) {
      throw new Error(`Column name at index ${i} must be a string`);
    }
  }

  // Check for duplicates
  const uniqueNames = new Set(columnNames);
  if (uniqueNames.size !== columnNames.length) {
    throw new Error('Column names must be unique');
  }

  // Validate length if specified
  if (expectedLength !== null && columnNames.length !== expectedLength) {
    throw new Error(
      `Expected ${expectedLength} column names, got ${columnNames.length}`
    );
  }

  return true;
}

/**
 * Validates that specified columns exist in a column names array
 * 
 * @param {Array<string>} requestedColumns - Columns to check
 * @param {Array<string>} availableColumns - Available column names
 * @returns {boolean} True if all requested columns exist
 * @throws {Error} If any requested column doesn't exist
 * 
 * @example
 * validateColumnsExist(['id', 'name'], ['id', 'name', 'age']) // true
 * validateColumnsExist(['id', 'invalid'], ['id', 'name']) // throws Error
 */
function validateColumnsExist(requestedColumns, availableColumns) {
  validateArray(requestedColumns, 'requestedColumns');
  validateArray(availableColumns, 'availableColumns');

  const availableSet = new Set(availableColumns);

  for (const col of requestedColumns) {
    if (!availableSet.has(col)) {
      throw new Error(`Column '${col}' does not exist`);
    }
  }

  return true;
}

/**
 * Validates that a column index is within valid range
 * 
 * @param {number} index - The column index to validate
 * @param {number} numColumns - Total number of columns
 * @returns {boolean} True if index is valid
 * @throws {Error} If index is out of range
 * 
 * @example
 * validateColumnIndex(0, 3) // true
 * validateColumnIndex(5, 3) // throws Error
 */
function validateColumnIndex(index, numColumns) {
  validateNumber(index, 'index');
  if (index < 0 || index >= numColumns) {
    throw new Error(
      `Column index ${index} out of range [0, ${numColumns - 1}]`
    );
  }
  return true;
}

/**
 * Validates that a row index is within valid range
 * 
 * @param {number} index - The row index to validate
 * @param {number} numRows - Total number of rows
 * @returns {boolean} True if index is valid
 * @throws {Error} If index is out of range
 * 
 * @example
 * validateRowIndex(0, 5) // true
 * validateRowIndex(10, 5) // throws Error
 */
function validateRowIndex(index, numRows) {
  validateNumber(index, 'index');
  if (index < 0 || index >= numRows) {
    throw new Error(`Row index ${index} out of range [0, ${numRows - 1}]`);
  }
  return true;
}

/**
 * Validates type compatibility for an operation
 * 
 * @param {*} value - The value to check
 * @param {string|Array<string>} expectedType - Expected type(s): 'numeric', 'string', 'boolean', 'date', etc.
 * @param {string} [operationName='operation'] - Name of the operation for error messages
 * @returns {boolean} True if type is compatible
 * @throws {Error} If type is not compatible
 * 
 * @example
 * validateTypeCompatibility(123, 'numeric', 'sum') // true
 * validateTypeCompatibility('hello', 'numeric', 'sum') // throws Error
 * validateTypeCompatibility(123, ['numeric', 'string']) // true
 */
function validateTypeCompatibility(value, expectedType, operationName = 'operation') {
  const actualType = typeDetection.detectType(value);
  const expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];

  if (!expectedTypes.includes(actualType)) {
    throw new Error(
      `${operationName} requires type(s) [${expectedTypes.join(', ')}], got ${actualType}`
    );
  }

  return true;
}

/**
 * Validates that all values in an array are of compatible types for numeric operations
 * 
 * @param {Array} values - The values to validate
 * @param {string} [operationName='numeric operation'] - Name of the operation
 * @returns {boolean} True if array contains numeric values
 * @throws {Error} If array contains no numeric values
 * 
 * @example
 * validateNumericArray([1, 2, 3]) // true
 * validateNumericArray([1, '2', 3]) // true (mixed numeric types)
 * validateNumericArray(['a', 'b', 'c']) // throws Error
 */
function validateNumericArray(values, operationName = 'numeric operation') {
  validateArray(values, 'values');

  const hasNumeric = values.some(v => typeDetection.isNumeric(v));

  if (!hasNumeric) {
    throw new Error(
      `${operationName} requires at least one numeric value`
    );
  }

  return true;
}

/**
 * Validates that a join key column exists in both DataFrames
 * 
 * @param {string} joinKey - The join key column name
 * @param {Array<string>} leftColumns - Left DataFrame column names
 * @param {Array<string>} rightColumns - Right DataFrame column names
 * @returns {boolean} True if join key exists in both
 * @throws {Error} If join key doesn't exist in either DataFrame
 * 
 * @example
 * validateJoinKey('id', ['id', 'name'], ['id', 'value']) // true
 * validateJoinKey('id', ['name'], ['id', 'value']) // throws Error
 */
function validateJoinKey(joinKey, leftColumns, rightColumns) {
  validateString(joinKey, 'joinKey');
  validateArray(leftColumns, 'leftColumns');
  validateArray(rightColumns, 'rightColumns');

  if (!leftColumns.includes(joinKey)) {
    throw new Error(`Join key '${joinKey}' not found in left DataFrame`);
  }

  if (!rightColumns.includes(joinKey)) {
    throw new Error(`Join key '${joinKey}' not found in right DataFrame`);
  }

  return true;
}

/**
 * Validates that a value can be coerced to a numeric type
 * 
 * @param {*} value - The value to validate
 * @param {string} [paramName='value'] - Parameter name for error messages
 * @returns {boolean} True if value can be coerced to numeric
 * @throws {Error} If value cannot be coerced to numeric
 * 
 * @example
 * validateNumericCoercible(123, 'count') // true
 * validateNumericCoercible('456', 'count') // true
 * validateNumericCoercible('abc', 'count') // throws Error
 */
function validateNumericCoercible(value, paramName = 'value') {
  if (!typeDetection.isNumeric(value)) {
    throw new Error(
      `${paramName} must be numeric or a numeric string, got ${typeDetection.detectType(value)}`
    );
  }
  return true;
}

/**
 * Validates that a value is a valid row object for a DataFrame
 * 
 * @param {Object} row - The row object to validate
 * @param {Array<string>} columnNames - Expected column names
 * @returns {boolean} True if row is valid
 * @throws {Error} If row is invalid
 * 
 * @example
 * validateRowObject({id: 1, name: 'John'}, ['id', 'name']) // true
 * validateRowObject({id: 1}, ['id', 'name']) // throws Error (missing column)
 */
function validateRowObject(row, columnNames) {
  if (typeof row !== 'object' || row === null || Array.isArray(row)) {
    throw new Error('Row must be an object');
  }

  validateArray(columnNames, 'columnNames');

  for (const col of columnNames) {
    if (!(col in row)) {
      throw new Error(`Row missing required column '${col}'`);
    }
  }

  return true;
}

module.exports = {
  validateNotNull,
  validateString,
  validateArray,
  validateNotEmpty,
  validateNumber,
  validateFunction,
  validateOneOf,
  validateDataFrameStructure,
  validateColumnNames,
  validateColumnsExist,
  validateColumnIndex,
  validateRowIndex,
  validateTypeCompatibility,
  validateNumericArray,
  validateJoinKey,
  validateNumericCoercible,
  validateRowObject
};
