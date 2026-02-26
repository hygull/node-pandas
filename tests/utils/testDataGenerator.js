/**
 * Test data generator utilities for creating sample data for tests
 */

/**
 * Generate a simple numeric array
 * @param {number} length - Length of array
 * @param {number} start - Starting value
 * @returns {number[]} Array of numbers
 */
function generateNumericArray(length = 10, start = 1) {
  return Array.from({ length }, (_, i) => start + i);
}

/**
 * Generate a numeric array with mixed types
 * @param {number} length - Length of array
 * @returns {(number|string|null)[]} Array with mixed types
 */
function generateMixedArray(length = 10) {
  const result = [];
  for (let i = 0; i < length; i++) {
    const type = i % 3;
    if (type === 0) result.push(i);
    else if (type === 1) result.push(`value_${i}`);
    else result.push(null);
  }
  return result;
}

/**
 * Generate a 2D array for DataFrame
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {number[][]} 2D array
 */
function generate2DArray(rows = 5, cols = 3) {
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => i * cols + j)
  );
}

/**
 * Generate sample DataFrame data with column names
 * @param {number} rows - Number of rows
 * @returns {Object} Object with data and columns
 */
function generateDataFrameData(rows = 5) {
  const data = Array.from({ length: rows }, (_, i) => [
    i + 1,
    `name_${i}`,
    Math.random() * 100
  ]);
  const columns = ['id', 'name', 'value'];
  return { data, columns };
}

/**
 * Generate sample data with categories for grouping
 * @param {number} rows - Number of rows
 * @returns {Object} Object with data and columns
 */
function generateCategoricalData(rows = 12) {
  const categories = ['A', 'B', 'C'];
  const data = Array.from({ length: rows }, (_, i) => [
    categories[i % 3],
    Math.floor(Math.random() * 100),
    Math.random() * 50
  ]);
  const columns = ['category', 'count', 'value'];
  return { data, columns };
}

/**
 * Generate sample data with null values
 * @param {number} rows - Number of rows
 * @returns {Object} Object with data and columns
 */
function generateDataWithNulls(rows = 5) {
  const data = Array.from({ length: rows }, (_, i) => [
    i + 1,
    i % 2 === 0 ? `name_${i}` : null,
    i % 3 === 0 ? null : Math.random() * 100
  ]);
  const columns = ['id', 'name', 'value'];
  return { data, columns };
}

/**
 * Generate sample data for merging
 * @returns {Object} Object with two datasets for merging
 */
function generateMergeData() {
  const left = {
    data: [
      [1, 'Alice'],
      [2, 'Bob'],
      [3, 'Charlie']
    ],
    columns: ['id', 'name']
  };
  
  const right = {
    data: [
      [1, 100],
      [2, 200],
      [3, 300]
    ],
    columns: ['id', 'score']
  };
  
  return { left, right };
}

module.exports = {
  generateNumericArray,
  generateMixedArray,
  generate2DArray,
  generateDataFrameData,
  generateCategoricalData,
  generateDataWithNulls,
  generateMergeData
};
