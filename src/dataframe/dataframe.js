/**
 * @fileoverview DataFrame class for the node-pandas library.
 * Provides a two-dimensional labeled data structure with columns of potentially
 * different types, similar to a spreadsheet or SQL table. Extends JavaScript's
 * native Array class to provide familiar array-like behavior while adding
 * pandas-specific functionality.
 * 
 * Validates: Requirements 1.2, 1.3, 1.4, 3.2, 3.3, 3.4, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 12.1-12.8
 */

const {
  dataType,
  getTransformedDataList,
  getIndicesColumns,
  excludingColumns
} = require('../utils/utils');

const messages = require('../messages/messages');
const Series = require('../series/series');
const CsvBase = require('../bases/CsvBase');
const { ValidationError, ColumnError, IndexError } = require('../utils/errors');
const validation = require('../utils/validation');
const typeDetection = require('../utils/typeDetection');

/**
 * NodeDataFrame class - A two-dimensional labeled data structure.
 * 
 * Extends JavaScript's Array class to provide array-like behavior while adding
 * pandas-specific functionality for data manipulation, selection, and analysis.
 * Each row is represented as an array, and columns are accessible by name.
 * 
 * @class NodeDataFrame
 * @extends Array
 * 
 * @example
 * // Create a DataFrame from a 2D array with column names
 * const df = new DataFrame(
 *   [[1, 'Alice', 25], [2, 'Bob', 30], [3, 'Charlie', 35]],
 *   ['id', 'name', 'age']
 * );
 * 
 * // Access columns as Series
 * const names = df.name; // Returns Series(['Alice', 'Bob', 'Charlie'])
 * 
 * // Access rows
 * const firstRow = df.getRow(0); // Returns {id: 1, name: 'Alice', age: 25}
 * 
 * // Access cells
 * const value = df.getCell(0, 'name'); // Returns 'Alice'
 * 
 * // Display data
 * df.show; // Displays formatted table
 */
class NodeDataFrame extends Array {
  /**
   * Creates a new DataFrame instance.
   * 
   * @param {Array<Array>} dataList - The data as a 2D array where each inner array represents a row
   * @param {Array<string>} [columns=null] - Column names. If not provided, will be auto-generated as 0, 1, 2, etc.
   * 
   * @throws {ValidationError} If dataList is not a valid 2D array structure
   * @throws {ValidationError} If columns length doesn't match the number of columns in data
   * @throws {ValidationError} If column names contain duplicates
   * 
   * @example
   * // With explicit column names
   * const df = new DataFrame(
   *   [[1, 'Alice'], [2, 'Bob']],
   *   ['id', 'name']
   * );
   * 
   * // Without column names (auto-generated)
   * const df2 = new DataFrame([[1, 'Alice'], [2, 'Bob']]);
   * // Columns will be ['0', '1']
   * 
   * @example
   * // Error handling
   * try {
   *   const df = new DataFrame([[1, 2], [3]], ['a', 'b']); // Inconsistent row lengths
   * } catch (error) {
   *   console.error(error.message); // "Row 1 has length 1, expected 2"
   * }
   */
  constructor(dataList, columns) {
    // Validate input data structure
    try {
      validation.validateDataFrameStructure(dataList);
    } catch (error) {
      throw new ValidationError(`Invalid DataFrame structure: ${error.message}`, {
        operation: 'DataFrame creation',
        value: dataList
      });
    }

    // Call the constructor of super class before using this keyword
    super(...dataList);

    let index;

    // Transform data and extract columns/index if not provided
    if (columns) {
      try {
        validation.validateColumnNames(columns, dataList.length > 0 ? dataList[0].length : 0);
        ({ index, dataList } = getTransformedDataList(dataList, columns));
      } catch (error) {
        throw new ValidationError(`Invalid column names: ${error.message}`, {
          operation: 'DataFrame creation',
          value: columns
        });
      }
    } else {
      if (dataList.length === 0) {
        // Handle empty DataFrame
        index = [];
        columns = [];
      } else {
        ({ index, columns } = getIndicesColumns(dataList));
      }
    }

    // Set properties
    this.columns = columns;
    this.index = index;
    this.data = dataList;
    this.rows = this.index.length;
    this.cols = this.columns.length;
    this.setDataForColumns();
    this.out = true; // Output on console
  }

  /**
   * Sets the internal data storage.
   * 
   * @param {Array<Array>} data - The data to store
   * @private
   */
  set data(data) {
    Object.defineProperty(NodeDataFrame.prototype, '_data', {
      value: data,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }

  /**
   * Gets the internal data storage.
   * 
   * @returns {Array<Array>} The stored data
   * @private
   */
  get data() {
    return this._data;
  }

  /**
   * Displays the DataFrame in a formatted table using console.table.
   * 
   * Provides a readable tabular representation of the DataFrame data,
   * useful for debugging and data inspection during development.
   * 
   * @returns {void}
   * 
   * @example
   * const df = new DataFrame([[1, 'Alice'], [2, 'Bob']], ['id', 'name']);
   * df.show;
   * // Outputs:
   * // ┌─────────┬────┬───────┐
   * // │ (index) │ id │ name  │
   * // ├─────────┼────┼───────┤
   * // │    0    │ 1  │ Alice │
   * // │    1    │ 2  │ Bob   │
   * // └─────────┴────┴───────┘
   */
  get show() {
    console.table(this.data);
  }

  /**
   * Gets a row by index as an object with column names as keys.
   * 
   * Returns a row object where each column name maps to its value in that row.
   * This provides a convenient way to access all values in a row with their
   * associated column names.
   * 
   * @param {number} rowIndex - The zero-based row index
   * @returns {Object} An object with column names as keys and row values as values
   * 
   * @throws {IndexError} If rowIndex is out of bounds
   * 
   * @example
   * const df = new DataFrame(
   *   [[1, 'Alice', 25], [2, 'Bob', 30]],
   *   ['id', 'name', 'age']
   * );
   * 
   * const row = df.getRow(0);
   * // Returns: {id: 1, name: 'Alice', age: 25}
   * 
   * @example
   * // Error handling
   * try {
   *   df.getRow(10); // Out of bounds
   * } catch (error) {
   *   console.error(error.message); // "Row index 10 out of range [0, 1]"
   * }
   */
  getRow(rowIndex) {
    try {
      validation.validateRowIndex(rowIndex, this.rows);
    } catch (error) {
      throw new IndexError(error.message, {
        operation: 'row access',
        value: rowIndex,
        expected: `index between 0 and ${this.rows - 1}`
      });
    }

    const row = {};
    const rowData = this.data[rowIndex];

    // Handle both array and object row formats
    if (Array.isArray(rowData)) {
      for (let i = 0; i < this.columns.length; i++) {
        row[this.columns[i]] = rowData[i];
      }
    } else if (typeof rowData === 'object' && rowData !== null) {
      // Data is already in object format
      for (const col of this.columns) {
        row[col] = rowData[col];
      }
    }

    return row;
  }

  /**
   * Gets a cell value by row index and column name.
   * 
   * Provides direct access to a specific cell in the DataFrame by combining
   * row index and column name. This is useful for accessing individual values
   * without creating intermediate row or column objects.
   * 
   * @param {number} rowIndex - The zero-based row index
   * @param {string} columnName - The column name
   * @returns {*} The value at the specified cell
   * 
   * @throws {IndexError} If rowIndex is out of bounds
   * @throws {ColumnError} If columnName doesn't exist
   * 
   * @example
   * const df = new DataFrame(
   *   [[1, 'Alice', 25], [2, 'Bob', 30]],
   *   ['id', 'name', 'age']
   * );
   * 
   * const value = df.getCell(0, 'name'); // Returns 'Alice'
   * const age = df.getCell(1, 'age');    // Returns 30
   * 
   * @example
   * // Error handling
   * try {
   *   df.getCell(0, 'nonexistent'); // Column doesn't exist
   * } catch (error) {
   *   console.error(error.message); // "Column 'nonexistent' does not exist"
   * }
   */
  getCell(rowIndex, columnName) {
    try {
      validation.validateRowIndex(rowIndex, this.rows);
    } catch (error) {
      throw new IndexError(error.message, {
        operation: 'cell access',
        value: rowIndex,
        expected: `index between 0 and ${this.rows - 1}`
      });
    }

    const colIndex = this.columns.indexOf(columnName);
    if (colIndex === -1) {
      throw new ColumnError(`Column '${columnName}' does not exist`, {
        operation: 'cell access',
        column: columnName,
        value: this.columns
      });
    }

    const rowData = this.data[rowIndex];

    // Handle both array and object row formats
    if (Array.isArray(rowData)) {
      return rowData[colIndex];
    } else if (typeof rowData === 'object' && rowData !== null) {
      // Data is already in object format
      return rowData[columnName];
    }

    return undefined;
  }

  /**
   * Creates a cached Series for a column and stores it internally.
   * 
   * This internal method is called when a column is first accessed to create
   * and cache a Series object for that column. Subsequent accesses return the
   * cached Series without recreating it.
   * 
   * @param {string} colName - The column name
   * @private
   * 
   * @example
   * // This is called internally when accessing df.columnName
   * // Users should not call this directly
   */
  setNewAttrib(colName) {
    this[`___${colName}___`] = this.data.map((row) => row[colName]);
  }

  /**
   * Sets up dynamic column accessors for all columns.
   * 
   * Creates getter properties for each column name that return Series objects
   * containing that column's data. This allows accessing columns using dot notation
   * (e.g., df.columnName) or bracket notation (e.g., df['columnName']).
   * 
   * The Series objects are cached after first access for performance.
   * 
   * @private
   * 
   * @example
   * // After this is called, you can access columns like:
   * const names = df.name;      // Returns Series
   * const ages = df['age'];     // Returns Series
   */
  setDataForColumns() {
    this.columns.forEach((colName) => {
      Object.defineProperty(NodeDataFrame.prototype, colName, {
        get: function() {
          // Create and cache the Series if not already created
          if (this[`___${colName}___`] === undefined) {
            this.setNewAttrib(colName);
          }

          // Return a Series object for this column
          return new Series(this[`___${colName}___`]);
        },
        configurable: true
      });
    });
  }
  /**
   * Selects specific columns from the DataFrame and returns a new DataFrame.
   *
   * Creates a new DataFrame containing only the specified columns, preserving
   * all rows and data types. This is useful for extracting a subset of columns
   * for analysis or further processing.
   *
   * @param {Array<string>} columnNames - Array of column names to select
   * @returns {NodeDataFrame} A new DataFrame with only the selected columns
   *
   * @throws {ValidationError} If columnNames is not an array
   * @throws {ColumnError} If any column name doesn't exist in the DataFrame
   *
   * @example
   * const df = new DataFrame(
   *   [[1, 'Alice', 25], [2, 'Bob', 30], [3, 'Charlie', 35]],
   *   ['id', 'name', 'age']
   * );
   *
   * // Select single column
   * const nameOnly = df.select(['name']);
   * // Returns DataFrame with 3 rows and 1 column: ['name']
   *
   * // Select multiple columns
   * const idAndName = df.select(['id', 'name']);
   * // Returns DataFrame with 3 rows and 2 columns: ['id', 'name']
   *
   * // Select in different order
   * const reordered = df.select(['age', 'name', 'id']);
   * // Returns DataFrame with columns in the specified order
   *
   * @example
   * // Error handling
   * try {
   *   df.select(['id', 'nonexistent']); // Column doesn't exist
   * } catch (error) {
   *   console.error(error.message); // "Column 'nonexistent' does not exist"
   * }
   */
  select(columnNames) {
    // Validate input
    try {
      validation.validateArray(columnNames, 'columnNames');
    } catch (error) {
      throw new ValidationError(`Invalid column names: ${error.message}`, {
        operation: 'select',
        value: columnNames
      });
    }

    // Validate that all requested columns exist
    try {
      validation.validateColumnsExist(columnNames, this.columns);
    } catch (error) {
      throw new ColumnError(error.message, {
        operation: 'select',
        column: columnNames.find(col => !this.columns.includes(col)),
        value: this.columns
      });
    }

    // Create new data with only selected columns
    const selectedData = this.data.map((row) => {
      const newRow = {};
      columnNames.forEach((colName) => {
        newRow[colName] = row[colName];
      });
      return newRow;
    });

    // Create and return new DataFrame with selected columns
    return new NodeDataFrame(
      selectedData.map((row) => columnNames.map((col) => row[col])),
      columnNames
    );
  }

}

// Apply CSV I/O mixin to DataFrame prototype
// https://javascript.info/mixins (class, Object)
Object.assign(NodeDataFrame.prototype, CsvBase);

/**
 * Factory function to create a new DataFrame instance.
 * 
 * This is the primary way to create DataFrame objects. It provides a convenient
 * factory function interface while internally using the NodeDataFrame class.
 * 
 * @param {Array<Array>} dataList - The data as a 2D array where each inner array represents a row
 * @param {Array<string>} [columns=null] - Column names. If not provided, will be auto-generated
 * @returns {NodeDataFrame} A new DataFrame instance
 * 
 * @throws {ValidationError} If dataList is not a valid 2D array structure
 * @throws {ValidationError} If columns are invalid
 * 
 * @example
 * // Create a DataFrame with explicit column names
 * const df = DataFrame(
 *   [[1, 'Alice', 25], [2, 'Bob', 30]],
 *   ['id', 'name', 'age']
 * );
 * 
 * // Create a DataFrame without column names
 * const df2 = DataFrame([[1, 'Alice'], [2, 'Bob']]);
 * 
 * // Access columns as Series
 * const names = df.name;
 * 
 * // Access rows
 * const firstRow = df.getRow(0);
 * 
 * // Access cells
 * const value = df.getCell(0, 'name');
 * 
 * // Display data
 * df.show;
 */
function DataFrame(dataList, columns = null) {
  const dataframe = new NodeDataFrame(dataList, columns);
  return dataframe;
}

// Exporting DataFrame so that it could be used by modules (i.e. they could import and use)
module.exports = DataFrame; 
