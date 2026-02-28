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
const GroupBy = require('../features/GroupBy');
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
  /**
   * Filters the DataFrame based on a condition function and returns a new DataFrame.
   *
   * Creates a new DataFrame containing only rows where the condition function
   * evaluates to true. The condition function receives a row object with column
   * names as keys. Multiple filters can be chained together to apply sequential
   * filtering conditions.
   *
   * @param {Function} condition - A function that takes a row object and returns a boolean
   * @returns {NodeDataFrame} A new DataFrame containing only rows that satisfy the condition
   *
   * @throws {ValidationError} If condition is not a function
   * @throws {ColumnError} If the condition references non-existent columns
   *
   * @example
   * const df = new DataFrame(
   *   [[1, 'Rishikesh Agrawani', 32], [2, 'Hemkesh Agrawani', 30], [3, 'Malinikesh Agrawani', 28]],
   *   ['id', 'name', 'age']
   * );
   *
   * // Filter rows where age > 29
   * const filtered = df.filter(row => row.age > 29);
   * // Returns DataFrame with 2 rows (Rishikesh and Hemkesh)
   *
   * // Filter rows where name includes 'Agrawani'
   * const allAgrawani = df.filter(row => row.name.includes('Agrawani'));
   * // Returns DataFrame with all 3 rows
   *
   * // Chain multiple filters
   * const result = df.filter(row => row.age > 28).filter(row => row.id < 3);
   * // Returns DataFrame with 2 rows (Rishikesh and Hemkesh)
   *
   * @example
   * // Filter that matches no rows
   * const empty = df.filter(row => row.age > 100);
   * // Returns empty DataFrame with same columns but no rows
   *
   * @example
   * // Error handling
   * try {
   *   df.filter('not a function'); // Invalid condition
   * } catch (error) {
   *   console.error(error.message); // "condition must be a function"
   * }
   */
  filter(condition) {
    // Validate input
    try {
      validation.validateFunction(condition, 'condition');
    } catch (error) {
      throw new ValidationError(`Invalid filter condition: ${error.message}`, {
        operation: 'filter',
        value: condition
      });
    }

    // Filter rows based on condition
    const filteredData = [];

    for (let i = 0; i < this.rows; i++) {
      const row = this.getRow(i);

      try {
        // Evaluate condition on the row
        const shouldInclude = condition(row);

        if (shouldInclude) {
          // Convert row object back to array format for new DataFrame
          const rowArray = this.columns.map(col => row[col]);
          filteredData.push(rowArray);
        }
      } catch (error) {
        // If condition throws an error, it likely references a non-existent column
        throw new ColumnError(
          `Filter condition error: ${error.message}`,
          {
            operation: 'filter',
            column: 'unknown',
            value: this.columns
          }
        );
      }
    }

    // Create and return new DataFrame with filtered data
    // For empty filtered data, we need to create a DataFrame with the same columns
    // but no rows. We do this by creating a new DataFrame with empty data and then
    // manually setting the columns property.
    if (filteredData.length === 0) {
      const emptyDf = new NodeDataFrame([]);
      emptyDf.columns = this.columns;
      emptyDf.cols = this.columns.length;
      emptyDf.setDataForColumns();
      return emptyDf;
    }

    return new NodeDataFrame(filteredData, this.columns);
  }

  /**
   * Groups the DataFrame by one or more columns and returns a GroupBy object.
   *
   * Creates a GroupBy object that supports aggregation methods (mean, sum, count, min, max, std).
   * Supports both single-column and multi-column grouping with hierarchical group organization.
   *
   * @param {string|Array<string>} columns - Column name(s) to group by
   * @returns {GroupBy} A GroupBy object for performing aggregations
   *
   * @throws {ValidationError} If columns is not a string or array
   * @throws {ColumnError} If any column doesn't exist in the DataFrame
   *
   * @example
   * const df = DataFrame(
   *   [[1, 'Rishikesh Agrawani', 32, 'Engineering'],
   *    [2, 'Hemkesh Agrawani', 30, 'Sales'],
   *    [3, 'Malinikesh Agrawani', 28, 'Engineering']],
   *   ['id', 'name', 'age', 'department']
   * );
   *
   * // Single-column grouping
   * const grouped = df.groupBy('department');
   * const meanAge = grouped.mean(); // Returns DataFrame with mean age by department
   * const counts = grouped.count(); // Returns DataFrame with counts by department
   *
   * // Multi-column grouping
   * const grouped2 = df.groupBy(['department', 'name']);
   * const sums = grouped2.sum(); // Returns DataFrame with sums by department and name
   *
   * @example
   * // Error handling
   * try {
   *   df.groupBy('nonexistent'); // Column doesn't exist
   * } catch (error) {
   *   console.error(error.message); // "Column 'nonexistent' does not exist"
   * }
   */
  groupBy(columns) {
    return new GroupBy(this, columns);
  }

  /**
   * Applies a transformation function to a specific column and returns a new DataFrame.
   *
   * Creates a new DataFrame where the specified column has been transformed by applying
   * the provided function to each value in that column. All other columns remain unchanged.
   * The function receives the value and its row index as parameters.
   *
   * @param {string} columnName - The name of the column to transform
   * @param {Function} fn - Transformation function that receives (value, rowIndex) and returns transformed value
   * @returns {NodeDataFrame} A new DataFrame with the transformed column
   *
   * @throws {ColumnError} If columnName doesn't exist in the DataFrame
   * @throws {ValidationError} If fn is not a function
   * @throws {Error} If the transformation function throws an error for any value
   *
   * @example
   * const df = DataFrame(
   *   [[1, 'Rishikesh Agrawani', 25], [2, 'Hemkesh Agrawani', 30], [3, 'Malinikesh Agrawani', 35]],
   *   ['id', 'name', 'age']
   * );
   *
   * // Transform age column by adding 5 to each value
   * const transformed = df.apply('age', (value) => value + 5);
   * // Returns DataFrame with ages [30, 35, 40]
   *
   * // Transform name column to uppercase
   * const upperNames = df.apply('name', (value) => value.toUpperCase());
   * // Returns DataFrame with names in uppercase
   *
   * // Use row index in transformation
   * const withRowIndex = df.apply('id', (value, rowIndex) => value + rowIndex * 100);
   * // Returns DataFrame with transformed id values
   *
   * @example
   * // Error handling
   * try {
   *   df.apply('nonexistent', (v) => v); // Column doesn't exist
   * } catch (error) {
   *   console.error(error.message); // "Column 'nonexistent' does not exist"
   * }
   */
  apply(columnName, fn) {
    // Validate column exists
    const colIndex = this.columns.indexOf(columnName);
    if (colIndex === -1) {
      throw new ColumnError(`Column '${columnName}' does not exist`, {
        operation: 'apply',
        column: columnName,
        value: this.columns
      });
    }

    // Validate function
    try {
      validation.validateFunction(fn, 'fn');
    } catch (error) {
      throw new ValidationError(`Invalid transformation function: ${error.message}`, {
        operation: 'apply',
        value: fn
      });
    }

    // Transform the column
    const transformedData = this.data.map((row, rowIndex) => {
      const newRow = { ...row };
      try {
        const currentValue = row[columnName];
        const transformedValue = fn(currentValue, rowIndex);
        newRow[columnName] = transformedValue;
      } catch (error) {
        throw new Error(
          `Transformation function failed at row ${rowIndex}, column '${columnName}': ${error.message}`
        );
      }
      return newRow;
    });

    // Convert to array format
    const arrayData = transformedData.map((row) => {
      return this.columns.map(col => row[col]);
    });

    // Create and return new DataFrame
    return new NodeDataFrame(arrayData, this.columns);
  }

  /**
   * Applies an element-wise transformation function across all cells in the DataFrame.
   *
   * Creates a new DataFrame where every value has been transformed by applying the provided
   * function to each cell. The function receives the value, row index, and column name as parameters.
   * The structure and column names are preserved.
   *
   * @param {Function} fn - Transformation function that receives (value, rowIndex, columnName) and returns transformed value
   * @returns {NodeDataFrame} A new DataFrame with all values transformed
   *
   * @throws {ValidationError} If fn is not a function
   * @throws {Error} If the transformation function throws an error for any value
   *
   * @example
   * const df = DataFrame(
   *   [[1, 'Rishikesh Agrawani', 25], [2, 'Hemkesh Agrawani', 30]],
   *   ['id', 'name', 'age']
   * );
   *
   * // Convert all values to strings
   * const allStrings = df.map((value) => String(value));
   * // Returns DataFrame with all values as strings
   *
   * // Add row and column info to each value
   * const withInfo = df.map((value, rowIndex, colName) => `${colName}[${rowIndex}]=${value}`);
   * // Returns DataFrame with formatted strings
   *
   * // Multiply numeric values by 2, keep others unchanged
   * const doubled = df.map((value) => typeof value === 'number' ? value * 2 : value);
   * // Returns DataFrame with numeric values doubled
   *
   * @example
   * // Error handling
   * try {
   *   df.map('not a function'); // Invalid function
   * } catch (error) {
   *   console.error(error.message); // "fn must be a function"
   * }
   */
  map(fn) {
    // Validate function
    try {
      validation.validateFunction(fn, 'fn');
    } catch (error) {
      throw new ValidationError(`Invalid transformation function: ${error.message}`, {
        operation: 'map',
        value: fn
      });
    }

    // Transform all cells
    const transformedData = this.data.map((row, rowIndex) => {
      const newRow = {};

      try {
        for (const columnName of this.columns) {
          const value = row[columnName];
          newRow[columnName] = fn(value, rowIndex, columnName);
        }
      } catch (error) {
        throw new Error(
          `Transformation function failed at row ${rowIndex}: ${error.message}`
        );
      }

      return newRow;
    });

    // Convert to array format
    const arrayData = transformedData.map((row) => {
      return this.columns.map(col => row[col]);
    });

    // Create and return new DataFrame
    return new NodeDataFrame(arrayData, this.columns);
  }

  /**
   * Replaces values in the DataFrame and returns a new DataFrame.
   *
   * Replaces all occurrences of oldValue with newValue. If columnName is specified,
   * only replaces values in that column. Otherwise, replaces across the entire DataFrame.
   * Supports both exact value matching and function-based matching.
   *
   * @param {*|Function} oldValue - Value to replace or function that returns true for values to replace
   * @param {*} newValue - Value to replace with
   * @param {string} [columnName] - Optional column name to limit replacement to that column only
   * @returns {NodeDataFrame} A new DataFrame with replacements made
   *
   * @throws {ColumnError} If columnName is provided but doesn't exist
   * @throws {ValidationError} If oldValue is neither a value nor a function
   *
   * @example
   * const df = DataFrame(
   *   [[1, 'Rishikesh Agrawani', 25], [2, 'Hemkesh Agrawani', null], [3, 'Malinikesh Agrawani', 35]],
   *   ['id', 'name', 'age']
   * );
   *
   * // Replace null values with 0 in entire DataFrame
   * const noNulls = df.replace(null, 0);
   * // Returns DataFrame with null replaced by 0
   *
   * // Replace in specific column only
   * const fixedAge = df.replace(null, 30, 'age');
   * // Returns DataFrame with null in age column replaced by 30
   *
   * // Replace using a function
   * const noSmallIds = df.replace((v) => v < 2, 999);
   * // Returns DataFrame with values < 2 replaced by 999
   *
   * // Replace undefined values
   * const noUndefined = df.replace(undefined, 'N/A');
   * // Returns DataFrame with undefined replaced by 'N/A'
   *
   * @example
   * // Error handling
   * try {
   *   df.replace(1, 2, 'nonexistent'); // Column doesn't exist
   * } catch (error) {
   *   console.error(error.message); // "Column 'nonexistent' does not exist"
   * }
   */
  replace(oldValue, newValue, columnName) {
    // Validate columnName if provided
    if (columnName !== undefined) {
      const colIndex = this.columns.indexOf(columnName);
      if (colIndex === -1) {
        throw new ColumnError(`Column '${columnName}' does not exist`, {
          operation: 'replace',
          column: columnName,
          value: this.columns
        });
      }
    }

    // Determine if oldValue is a function
    const isFunction = typeof oldValue === 'function';

    // Transform data
    const transformedData = this.data.map((row) => {
      const newRow = { ...row };

      if (columnName !== undefined) {
        // Replace in specific column only
        const currentValue = row[columnName];
        const shouldReplace = isFunction ? oldValue(currentValue) : currentValue === oldValue;

        if (shouldReplace) {
          newRow[columnName] = newValue;
        }
      } else {
        // Replace across entire row
        for (const col of this.columns) {
          const shouldReplace = isFunction ? oldValue(newRow[col]) : newRow[col] === oldValue;
          if (shouldReplace) {
            newRow[col] = newValue;
          }
        }
      }

      return newRow;
    });

    // Convert to array format
    const arrayData = transformedData.map((row) => {
      return this.columns.map(col => row[col]);
    });

    // Create and return new DataFrame
    return new NodeDataFrame(arrayData, this.columns);
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
