/**
 * Custom assertion utilities for testing
 */

/**
 * Assert that two arrays are deeply equal
 * @param {any[]} actual - Actual array
 * @param {any[]} expected - Expected array
 * @param {string} message - Error message
 */
function assertArrayEqual(actual, expected, message = '') {
  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    throw new Error(`${message} - Both values must be arrays`);
  }
  
  if (actual.length !== expected.length) {
    throw new Error(
      `${message} - Array length mismatch: expected ${expected.length}, got ${actual.length}`
    );
  }
  
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(
        `${message} - Array element mismatch at index ${i}: expected ${expected[i]}, got ${actual[i]}`
      );
    }
  }
}

/**
 * Assert that a value is numeric
 * @param {any} value - Value to check
 * @param {string} message - Error message
 */
function assertNumeric(value, message = '') {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${message} - Expected numeric value, got ${typeof value}`);
  }
}

/**
 * Assert that a value is a string
 * @param {any} value - Value to check
 * @param {string} message - Error message
 */
function assertString(value, message = '') {
  if (typeof value !== 'string') {
    throw new Error(`${message} - Expected string, got ${typeof value}`);
  }
}

/**
 * Assert that a value is null or undefined
 * @param {any} value - Value to check
 * @param {string} message - Error message
 */
function assertNullish(value, message = '') {
  if (value !== null && value !== undefined) {
    throw new Error(`${message} - Expected null or undefined, got ${value}`);
  }
}

/**
 * Assert that two numeric values are approximately equal
 * @param {number} actual - Actual value
 * @param {number} expected - Expected value
 * @param {number} tolerance - Tolerance for comparison
 * @param {string} message - Error message
 */
function assertApproximatelyEqual(actual, expected, tolerance = 0.0001, message = '') {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `${message} - Values not approximately equal: expected ${expected}, got ${actual} (tolerance: ${tolerance})`
    );
  }
}

/**
 * Assert that a value is an instance of a class
 * @param {any} value - Value to check
 * @param {Function} constructor - Constructor function
 * @param {string} message - Error message
 */
function assertInstanceOf(value, constructor, message = '') {
  if (!(value instanceof constructor)) {
    throw new Error(
      `${message} - Expected instance of ${constructor.name}, got ${typeof value}`
    );
  }
}

/**
 * Assert that an object has specific properties
 * @param {Object} obj - Object to check
 * @param {string[]} properties - Property names to check
 * @param {string} message - Error message
 */
function assertHasProperties(obj, properties, message = '') {
  for (const prop of properties) {
    if (!(prop in obj)) {
      throw new Error(`${message} - Object missing property: ${prop}`);
    }
  }
}

/**
 * Assert that a 2D array has specific dimensions
 * @param {any[][]} array - 2D array to check
 * @param {number} expectedRows - Expected number of rows
 * @param {number} expectedCols - Expected number of columns
 * @param {string} message - Error message
 */
function assert2DArrayDimensions(array, expectedRows, expectedCols, message = '') {
  if (!Array.isArray(array)) {
    throw new Error(`${message} - Expected array, got ${typeof array}`);
  }
  
  if (array.length !== expectedRows) {
    throw new Error(
      `${message} - Row count mismatch: expected ${expectedRows}, got ${array.length}`
    );
  }
  
  for (let i = 0; i < array.length; i++) {
    if (!Array.isArray(array[i]) || array[i].length !== expectedCols) {
      throw new Error(
        `${message} - Column count mismatch at row ${i}: expected ${expectedCols}, got ${array[i]?.length || 'not an array'}`
      );
    }
  }
}

module.exports = {
  assertArrayEqual,
  assertNumeric,
  assertString,
  assertNullish,
  assertApproximatelyEqual,
  assertInstanceOf,
  assertHasProperties,
  assert2DArrayDimensions
};
