/**
 * @fileoverview GroupBy class for the node-pandas library.
 * Provides grouping and aggregation functionality for DataFrames.
 * Allows grouping data by one or more columns and computing aggregate statistics
 * for each group.
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

const Series = require('../series/series');
const { ValidationError, ColumnError } = require('../utils/errors');
const validation = require('../utils/validation');
const typeDetection = require('../utils/typeDetection');

/**
 * GroupBy class - Groups DataFrame rows by one or more columns.
 * 
 * Provides aggregation methods (mean, sum, count, min, max, std) that compute
 * statistics for each group. Supports both single-column and multi-column grouping
 * with hierarchical group organization.
 * 
 * @class GroupBy
 * 
 * @example
 * // Single-column grouping
 * const df = DataFrame(
 *   [[1, 'Rishikesh Agrawani', 32, 'Engineering'],
 *    [2, 'Hemkesh Agrawani', 30, 'Sales'],
 *    [3, 'Malinikesh Agrawani', 28, 'Engineering']],
 *   ['id', 'name', 'age', 'department']
 * );
 * 
 * const grouped = df.groupBy('department');
 * const meanAge = grouped.mean(); // Returns DataFrame with mean age by department
 * 
 * @example
 * // Multi-column grouping
 * const grouped = df.groupBy(['department', 'name']);
 * const counts = grouped.count(); // Returns DataFrame with counts by department and name
 */
class GroupBy {
  /**
   * Creates a new GroupBy instance.
   * 
   * @param {DataFrame} dataframe - The DataFrame to group
   * @param {string|Array<string>} groupingColumns - Column name(s) to group by
   * 
   * @throws {ValidationError} If groupingColumns is not a string or array
   * @throws {ColumnError} If any grouping column doesn't exist in the DataFrame
   * 
   * @example
   * const grouped = new GroupBy(df, 'department');
   * const grouped2 = new GroupBy(df, ['department', 'name']);
   */
  constructor(dataframe, groupingColumns) {
    // Validate inputs
    if (!dataframe || typeof dataframe !== 'object') {
      throw new ValidationError('dataframe must be a valid DataFrame', {
        operation: 'GroupBy creation',
        value: dataframe
      });
    }

    // Normalize groupingColumns to array
    let columns = groupingColumns;
    if (typeof groupingColumns === 'string') {
      columns = [groupingColumns];
    } else if (Array.isArray(groupingColumns)) {
      columns = groupingColumns;
    } else {
      throw new ValidationError('groupingColumns must be a string or array of strings', {
        operation: 'GroupBy creation',
        value: groupingColumns
      });
    }

    // Validate that all grouping columns exist
    try {
      validation.validateColumnsExist(columns, dataframe.columns);
    } catch (error) {
      throw new ColumnError(error.message, {
        operation: 'GroupBy creation',
        column: columns.find(col => !dataframe.columns.includes(col)),
        value: dataframe.columns
      });
    }

    this.dataframe = dataframe;
    this.groupingColumns = columns;
    this.groups = this._createGroups();
  }

  /**
   * Creates internal group structure from the DataFrame.
   * 
   * For single-column grouping, creates a map where keys are group values
   * and values are arrays of row indices.
   * 
   * For multi-column grouping, creates a hierarchical structure where each
   * level represents a grouping column.
   * 
   * @returns {Map|Object} The group structure
   * @private
   */
  _createGroups() {
    if (this.groupingColumns.length === 1) {
      return this._createSingleColumnGroups();
    } else {
      return this._createMultiColumnGroups();
    }
  }

  /**
   * Creates groups for single-column grouping.
   * 
   * @returns {Map} Map where keys are group values and values are row indices
   * @private
   */
  _createSingleColumnGroups() {
    const groups = new Map();
    const groupColumn = this.groupingColumns[0];
    const columnIndex = this.dataframe.columns.indexOf(groupColumn);

    for (let i = 0; i < this.dataframe.rows; i++) {
      const row = this.dataframe.data[i];
      const groupKey = Array.isArray(row) ? row[columnIndex] : row[groupColumn];
      const keyStr = String(groupKey);

      if (!groups.has(keyStr)) {
        groups.set(keyStr, []);
      }
      groups.get(keyStr).push(i);
    }

    return groups;
  }

  /**
   * Creates hierarchical groups for multi-column grouping.
   * 
   * @returns {Object} Hierarchical object structure representing groups
   * @private
   */
  _createMultiColumnGroups() {
    const groups = {};

    for (let i = 0; i < this.dataframe.rows; i++) {
      const row = this.dataframe.data[i];
      let current = groups;

      // Navigate/create hierarchy for each grouping column
      for (let j = 0; j < this.groupingColumns.length; j++) {
        const colName = this.groupingColumns[j];
        const columnIndex = this.dataframe.columns.indexOf(colName);
        const value = Array.isArray(row) ? row[columnIndex] : row[colName];
        const keyStr = String(value);

        if (j === this.groupingColumns.length - 1) {
          // Last column - store row indices
          if (!current[keyStr]) {
            current[keyStr] = [];
          }
          current[keyStr].push(i);
        } else {
          // Intermediate column - create nested object
          if (!current[keyStr]) {
            current[keyStr] = {};
          }
          current = current[keyStr];
        }
      }
    }

    return groups;
  }

  /**
   * Extracts all row indices from hierarchical group structure.
   * 
   * @param {Object} obj - The group object (may be nested)
   * @returns {Array<number>} Array of row indices
   * @private
   */
  _extractRowIndices(obj) {
    if (Array.isArray(obj)) {
      return obj;
    }

    const indices = [];
    for (const key in obj) {
      indices.push(...this._extractRowIndices(obj[key]));
    }
    return indices;
  }

  /**
   * Computes the mean for each group.
   * 
   * Returns a DataFrame where each row represents a group with its grouping
   * column values and the mean of numeric columns for that group.
   * Non-numeric values are excluded from the calculation.
   * 
   * @returns {DataFrame} DataFrame with group keys and mean values
   * 
   * @example
   * const grouped = df.groupBy('department');
   * const result = grouped.mean();
   * // Returns DataFrame with columns: ['department', 'id', 'age']
   * // Each row contains the group key and mean values for numeric columns
   */
  mean() {
    return this._aggregateNumeric('mean');
  }

  /**
   * Computes the sum for each group.
   * 
   * Returns a DataFrame where each row represents a group with its grouping
   * column values and the sum of numeric columns for that group.
   * Non-numeric values are excluded from the calculation.
   * 
   * @returns {DataFrame} DataFrame with group keys and sum values
   * 
   * @example
   * const grouped = df.groupBy('department');
   * const result = grouped.sum();
   * // Returns DataFrame with columns: ['department', 'id', 'age']
   * // Each row contains the group key and sum values for numeric columns
   */
  sum() {
    return this._aggregateNumeric('sum');
  }

  /**
   * Computes the count for each group.
   * 
   * Returns a DataFrame where each row represents a group with its grouping
   * column values and the count of rows in that group.
   * 
   * @returns {DataFrame} DataFrame with group keys and counts
   * 
   * @example
   * const grouped = df.groupBy('department');
   * const result = grouped.count();
   * // Returns DataFrame with columns: ['department', 'count']
   * // Each row contains the group key and the number of rows in that group
   */
  count() {
    const results = [];
    const groupKeys = this._getGroupKeys();

    for (const groupKey of groupKeys) {
      const rowIndices = this._getRowIndicesForKey(groupKey);
      const resultRow = this._buildResultRow(groupKey, { count: rowIndices.length });
      results.push(resultRow);
    }

    return this._createResultDataFrame(results, { count: true });
  }

  /**
   * Computes the minimum for each group.
   * 
   * Returns a DataFrame where each row represents a group with its grouping
   * column values and the minimum of numeric columns for that group.
   * Non-numeric values are excluded from the calculation.
   * 
   * @returns {DataFrame} DataFrame with group keys and minimum values
   * 
   * @example
   * const grouped = df.groupBy('department');
   * const result = grouped.min();
   * // Returns DataFrame with columns: ['department', 'id', 'age']
   * // Each row contains the group key and minimum values for numeric columns
   */
  min() {
    return this._aggregateNumeric('min');
  }

  /**
   * Computes the maximum for each group.
   * 
   * Returns a DataFrame where each row represents a group with its grouping
   * column values and the maximum of numeric columns for that group.
   * Non-numeric values are excluded from the calculation.
   * 
   * @returns {DataFrame} DataFrame with group keys and maximum values
   * 
   * @example
   * const grouped = df.groupBy('department');
   * const result = grouped.max();
   * // Returns DataFrame with columns: ['department', 'id', 'age']
   * // Each row contains the group key and maximum values for numeric columns
   */
  max() {
    return this._aggregateNumeric('max');
  }

  /**
   * Computes the standard deviation for each group.
   * 
   * Returns a DataFrame where each row represents a group with its grouping
   * column values and the standard deviation of numeric columns for that group.
   * Non-numeric values are excluded from the calculation.
   * Uses sample standard deviation (divides by n-1).
   * 
   * @returns {DataFrame} DataFrame with group keys and standard deviation values
   * 
   * @example
   * const grouped = df.groupBy('department');
   * const result = grouped.std();
   * // Returns DataFrame with columns: ['department', 'id', 'age']
   * // Each row contains the group key and std values for numeric columns
   */
  std() {
    return this._aggregateNumeric('std');
  }

  /**
   * Aggregates numeric columns using the specified method.
   * 
   * @param {string} method - The aggregation method ('mean', 'sum', 'min', 'max', 'std')
   * @returns {DataFrame} DataFrame with aggregation results
   * @private
   */
  _aggregateNumeric(method) {
    const results = [];
    const groupKeys = this._getGroupKeys();

    for (const groupKey of groupKeys) {
      const rowIndices = this._getRowIndicesForKey(groupKey);
      const aggregations = {};

      // Aggregate each numeric column
      for (let colIndex = 0; colIndex < this.dataframe.columns.length; colIndex++) {
        const colName = this.dataframe.columns[colIndex];

        // Skip grouping columns
        if (this.groupingColumns.includes(colName)) {
          continue;
        }

        // Extract values for this column from the group
        const values = rowIndices.map(rowIdx => {
          const row = this.dataframe.data[rowIdx];
          return Array.isArray(row) ? row[colIndex] : row[colName];
        });

        // Check if column is numeric
        const numericValues = values
          .map(v => this._toNumeric(v))
          .filter(v => v !== null);

        if (numericValues.length > 0) {
          aggregations[colName] = this._computeAggregation(method, numericValues);
        }
      }

      const resultRow = this._buildResultRow(groupKey, aggregations);
      results.push(resultRow);
    }

    return this._createResultDataFrame(results, { numeric: true });
  }

  /**
   * Converts a value to numeric if possible.
   * 
   * @param {*} value - The value to convert
   * @returns {number|null} The numeric value or null if not convertible
   * @private
   */
  _toNumeric(value) {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    }

    return null;
  }

  /**
   * Computes an aggregation on numeric values.
   * 
   * @param {string} method - The aggregation method
   * @param {Array<number>} values - The numeric values to aggregate
   * @returns {number} The aggregation result
   * @private
   */
  _computeAggregation(method, values) {
    if (values.length === 0) {
      return null;
    }

    switch (method) {
      case 'mean':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'std':
        if (values.length < 2) {
          return null;
        }
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (values.length - 1);
        return Math.sqrt(variance);
      default:
        return null;
    }
  }

  /**
   * Gets all unique group keys.
   * 
   * @returns {Array} Array of group keys
   * @private
   */
  _getGroupKeys() {
    if (this.groupingColumns.length === 1) {
      return Array.from(this.groups.keys());
    } else {
      return this._extractGroupKeys(this.groups);
    }
  }

  /**
   * Extracts all group keys from hierarchical structure.
   * 
   * @param {Object} obj - The group object
   * @param {Array} prefix - The prefix for hierarchical keys
   * @returns {Array} Array of group keys
   * @private
   */
  _extractGroupKeys(obj, prefix = []) {
    const keys = [];

    for (const key in obj) {
      const value = obj[key];
      const currentPrefix = [...prefix, key];

      if (Array.isArray(value)) {
        // Leaf node - this is a complete group key
        keys.push(currentPrefix);
      } else {
        // Intermediate node - recurse
        keys.push(...this._extractGroupKeys(value, currentPrefix));
      }
    }

    return keys;
  }

  /**
   * Gets row indices for a specific group key.
   * 
   * @param {string|Array} groupKey - The group key
   * @returns {Array<number>} Array of row indices in this group
   * @private
   */
  _getRowIndicesForKey(groupKey) {
    if (this.groupingColumns.length === 1) {
      return this.groups.get(String(groupKey)) || [];
    } else {
      // Navigate hierarchical structure
      let current = this.groups;
      const keyArray = Array.isArray(groupKey) ? groupKey : [groupKey];

      for (const key of keyArray) {
        current = current[String(key)];
        if (!current) {
          return [];
        }
      }

      return Array.isArray(current) ? current : [];
    }
  }

  /**
   * Builds a result row with group key and aggregation values.
   * 
   * @param {string|Array} groupKey - The group key
   * @param {Object} aggregations - The aggregation values
   * @returns {Array} The result row as an array
   * @private
   */
  _buildResultRow(groupKey, aggregations) {
    const keyArray = Array.isArray(groupKey) ? groupKey : [groupKey];
    const row = {};

    // Add grouping column values
    for (let i = 0; i < this.groupingColumns.length; i++) {
      row[this.groupingColumns[i]] = keyArray[i];
    }

    // Add aggregation values
    for (const colName in aggregations) {
      row[colName] = aggregations[colName];
    }

    return row;
  }

  /**
   * Creates a result DataFrame from aggregation results.
   * 
   * @param {Array<Array>} results - The result rows
   * @param {Object} options - Options for result creation
   * @returns {DataFrame} The result DataFrame
   * @private
   */
  _createResultDataFrame(results, options = {}) {
    // Import here to avoid circular dependency
    const DataFrameFactory = require('../dataframe/dataframe');

    // Build column names: grouping columns + aggregated columns
    const resultColumns = [...this.groupingColumns];

    if (options.count) {
      resultColumns.push('count');
    } else {
      // Add non-grouping columns
      for (const colName of this.dataframe.columns) {
        if (!this.groupingColumns.includes(colName)) {
          resultColumns.push(colName);
        }
      }
    }

    // Create DataFrame from results
    if (results.length === 0) {
      // Return empty DataFrame with correct columns
      const emptyDf = DataFrameFactory([]);
      emptyDf.columns = resultColumns;
      emptyDf.cols = resultColumns.length;
      emptyDf.setDataForColumns();
      return emptyDf;
    }

    // Convert object rows to array rows in the correct column order
    const arrayResults = results.map(row => {
      return resultColumns.map(col => row[col] !== undefined ? row[col] : null);
    });

    return DataFrameFactory(arrayResults, resultColumns);
  }
}

module.exports = GroupBy;
