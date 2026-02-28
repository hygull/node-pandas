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
        // Only validate column count if data is not empty
        if (dataList.length > 0) {
          validation.validateColumnNames(columns, dataList[0].length);
        }
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
    Object.defineProperty(this, '_data', {
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
    // Reserved property names that should not be overridden
    const reservedNames = new Set(['columns', 'index', 'data', 'rows', 'cols', 'out', 'show', 'getRow', 'getCell', 'setNewAttrib', 'setDataForColumns']);
    
    this.columns.forEach((colName) => {
      // Skip reserved property names to avoid shadowing class properties
      if (reservedNames.has(colName)) {
        return;
      }
      
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

  /**
   * Returns a summary statistics DataFrame for numeric and non-numeric columns.
   *
   * Generates a DataFrame containing statistical measures for all columns in the original DataFrame.
   * For numeric columns: count, mean, std, min, 25%, 50%, 75%, max
   * For non-numeric columns: count, unique, top, freq
   *
   * The returned DataFrame has statistics as rows and original column names as the index.
   * Null and undefined values are excluded from all calculations.
   *
   * @returns {NodeDataFrame} A new DataFrame with statistics as rows and column names as index
   *
   * @example
   * const df = DataFrame(
   *   [[1, 'Rishikesh Agrawani', 25], [2, 'Hemkesh Agrawani', 30], [3, 'Malinikesh Agrawani', 35]],
   *   ['id', 'name', 'age']
   * );
   *
   * const stats = df.describe();
   * // Returns DataFrame with statistics:
   * // Row 0 (count):  {id: 3, name: 3, age: 3}
   * // Row 1 (mean):   {id: 2, name: NaN, age: 30}
   * // Row 2 (std):    {id: 1, name: NaN, age: 5}
   * // Row 3 (min):    {id: 1, name: 'Hemkesh Agrawani', age: 25}
   * // Row 4 (25%):    {id: 1.5, name: NaN, age: 27.5}
   * // Row 5 (50%):    {id: 2, name: NaN, age: 30}
   * // Row 6 (75%):    {id: 2.5, name: NaN, age: 32.5}
   * // Row 7 (max):    {id: 3, name: 'Rishikesh Agrawani', age: 35}
   * // Row 8 (unique): {id: NaN, name: 3, age: NaN}
   * // Row 9 (top):    {id: NaN, name: 'Hemkesh Agrawani', age: NaN}
   * // Row 10 (freq):  {id: NaN, name: 1, age: NaN}
   *
   * @example
   * // With null/undefined values
   * const df2 = DataFrame(
   *   [[1, 'Alice', 25], [2, null, 30], [3, 'Charlie', null]],
   *   ['id', 'name', 'age']
   * );
   * const stats2 = df2.describe();
   * // Null/undefined values are excluded from calculations
   * // count for 'name' would be 2 (excluding the null)
   * // count for 'age' would be 2 (excluding the null)
   *
   * @example
   * // Empty DataFrame
   * const emptyDf = DataFrame([]);
   * const emptyStats = emptyDf.describe();
   * // Returns empty DataFrame with no rows or columns
   */
  describe() {
    // Handle empty DataFrame
    if (this.rows === 0 || this.cols === 0) {
      return new NodeDataFrame([]);
    }

    // Helper function to check if a value is numeric
    const isNumeric = (value) => {
      return value !== null && value !== undefined && !isNaN(value) && typeof value === 'number';
    };

    // Helper function to get numeric values from a column (excluding null/undefined)
    const getNumericValues = (columnName) => {
      const values = [];
      for (let i = 0; i < this.rows; i++) {
        const value = this.getCell(i, columnName);
        if (isNumeric(value)) {
          values.push(value);
        }
      }
      return values.sort((a, b) => a - b);
    };

    // Helper function to get non-null values from a column
    const getNonNullValues = (columnName) => {
      const values = [];
      for (let i = 0; i < this.rows; i++) {
        const value = this.getCell(i, columnName);
        if (value !== null && value !== undefined) {
          values.push(value);
        }
      }
      return values;
    };

    // Helper function to calculate percentile
    const percentile = (values, p) => {
      if (values.length === 0) return NaN;
      const index = (p / 100) * (values.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index % 1;

      if (lower === upper) {
        return values[lower];
      }
      return values[lower] * (1 - weight) + values[upper] * weight;
    };

    // Helper function to calculate mean
    const mean = (values) => {
      if (values.length === 0) return NaN;
      return values.reduce((a, b) => a + b, 0) / values.length;
    };

    // Helper function to calculate standard deviation
    const std = (values) => {
      if (values.length < 2) return NaN;
      const avg = mean(values);
      const squareDiffs = values.map(value => Math.pow(value - avg, 2));
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
      return Math.sqrt(avgSquareDiff);
    };

    // Helper function to get mode (most frequent value)
    const getMode = (values) => {
      if (values.length === 0) return undefined;
      const frequency = {};
      let maxFreq = 0;
      let mode = values[0];

      for (const value of values) {
        frequency[value] = (frequency[value] || 0) + 1;
        if (frequency[value] > maxFreq) {
          maxFreq = frequency[value];
          mode = value;
        }
      }
      return mode;
    };

    // Helper function to get frequency of mode
    const getModeFrequency = (values) => {
      if (values.length === 0) return 0;
      const frequency = {};
      let maxFreq = 0;

      for (const value of values) {
        frequency[value] = (frequency[value] || 0) + 1;
        maxFreq = Math.max(maxFreq, frequency[value]);
      }
      return maxFreq;
    };

    // Build statistics rows
    const statsRows = [];
    const statNames = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max', 'unique', 'top', 'freq'];

    // For each statistic, create a row
    for (const statName of statNames) {
      const row = {};

      for (const columnName of this.columns) {
        const numericValues = getNumericValues(columnName);
        const nonNullValues = getNonNullValues(columnName);

        if (statName === 'count') {
          row[columnName] = nonNullValues.length;
        } else if (statName === 'mean') {
          row[columnName] = numericValues.length > 0 ? mean(numericValues) : NaN;
        } else if (statName === 'std') {
          row[columnName] = numericValues.length > 0 ? std(numericValues) : NaN;
        } else if (statName === 'min') {
          row[columnName] = numericValues.length > 0 ? numericValues[0] : (nonNullValues.length > 0 ? nonNullValues[0] : NaN);
        } else if (statName === '25%') {
          row[columnName] = numericValues.length > 0 ? percentile(numericValues, 25) : NaN;
        } else if (statName === '50%') {
          row[columnName] = numericValues.length > 0 ? percentile(numericValues, 50) : NaN;
        } else if (statName === '75%') {
          row[columnName] = numericValues.length > 0 ? percentile(numericValues, 75) : NaN;
        } else if (statName === 'max') {
          row[columnName] = numericValues.length > 0 ? numericValues[numericValues.length - 1] : (nonNullValues.length > 0 ? nonNullValues[nonNullValues.length - 1] : NaN);
        } else if (statName === 'unique') {
          const uniqueValues = new Set(nonNullValues);
          row[columnName] = numericValues.length > 0 ? NaN : uniqueValues.size;
        } else if (statName === 'top') {
          row[columnName] = numericValues.length > 0 ? NaN : getMode(nonNullValues);
        } else if (statName === 'freq') {
          row[columnName] = numericValues.length > 0 ? NaN : getModeFrequency(nonNullValues);
        }
      }

      statsRows.push(row);
    }

    // Convert rows to array format
    const arrayData = statsRows.map((row) => {
      return this.columns.map(col => row[col]);
    });

    // Create DataFrame with statistics
    const statsDataFrame = new NodeDataFrame(arrayData, this.columns);

    // Set custom index with statistic names
    statsDataFrame.index = statNames;

    return statsDataFrame;
  }
  /**
   * Merges this DataFrame with another DataFrame based on a join key.
   *
   * Combines two DataFrames by matching rows based on a common key column.
   * Supports inner, left, right, and outer joins. When column names conflict
   * (excluding the join key), suffixes are added to distinguish them.
   *
   * @param {NodeDataFrame} otherDataFrame - The DataFrame to merge with
   * @param {string|Array<string>} onKey - Column name(s) to join on. Can be a single column name or array of column names for multi-column joins
   * @param {string} [how='inner'] - Join type: 'inner', 'left', 'right', or 'outer'
   *   - 'inner': Keep only rows with matching keys in both DataFrames
   *   - 'left': Keep all rows from left DataFrame, matching rows from right
   *   - 'right': Keep all rows from right DataFrame, matching rows from left
   *   - 'outer': Keep all rows from both DataFrames
   * @param {Array<string>} [suffixes=['_x', '_y']] - Suffixes to add to conflicting column names from left and right DataFrames
   *
   * @returns {NodeDataFrame} A new merged DataFrame
   *
   * @throws {ValidationError} If otherDataFrame is not a DataFrame
   * @throws {ColumnError} If join key(s) don't exist in either DataFrame
   * @throws {ValidationError} If join type is invalid
   *
   * @example
   * // Single column join
   * const df1 = DataFrame(
   *   [[1, 'Rishikesh Agrawani'], [2, 'Hemkesh Agrawani']],
   *   ['id', 'name']
   * );
   * const df2 = DataFrame(
   *   [[1, 25], [2, 30]],
   *   ['id', 'age']
   * );
   * const merged = df1.merge(df2, 'id');
   * // Result: [[1, 'Rishikesh Agrawani', 25], [2, 'Hemkesh Agrawani', 30]]
   * // Columns: ['id', 'name', 'age']
   *
   * @example
   * // Left join with conflicting column names
   * const df1 = DataFrame(
   *   [[1, 'Alice', 'NY'], [2, 'Bob', 'LA']],
   *   ['id', 'name', 'city']
   * );
   * const df2 = DataFrame(
   *   [[1, 'NYC'], [2, 'LAX']],
   *   ['id', 'city']
   * );
   * const merged = df1.merge(df2, 'id', 'left', ['_left', '_right']);
   * // Columns: ['id', 'name', 'city_left', 'city_right']
   *
   * @example
   * // Multi-column join
   * const df1 = DataFrame(
   *   [[1, 'A', 100], [1, 'B', 200]],
   *   ['id', 'type', 'value']
   * );
   * const df2 = DataFrame(
   *   [[1, 'A', 'X'], [1, 'B', 'Y']],
   *   ['id', 'type', 'category']
   * );
   * const merged = df1.merge(df2, ['id', 'type']);
   * // Matches on both id and type columns
   */
  merge(otherDataFrame, onKey, how = 'inner', suffixes = ['_x', '_y']) {
    // Validate inputs
    if (!(otherDataFrame instanceof NodeDataFrame)) {
      throw new ValidationError('otherDataFrame must be a DataFrame instance', {
        operation: 'merge',
        value: otherDataFrame
      });
    }

    // Handle empty DataFrames
    if (this.rows === 0 && otherDataFrame.rows === 0) {
      return new NodeDataFrame([]);
    }
    
    if (this.rows === 0) {
      // For inner join, return empty DataFrame
      // For left join, return empty DataFrame (no rows from left)
      // For right join, return otherDataFrame
      // For outer join, return otherDataFrame
      if (how === 'right' || how === 'outer') {
        return otherDataFrame;
      } else {
        return new NodeDataFrame([]);
      }
    }
    
    if (otherDataFrame.rows === 0) {
      // For inner join, return empty DataFrame
      // For left join, return this DataFrame
      // For right join, return empty DataFrame (no rows from right)
      // For outer join, return this DataFrame
      if (how === 'left' || how === 'outer') {
        return this;
      } else {
        return new NodeDataFrame([]);
      }
    }

    // Normalize onKey to array
    const joinKeys = Array.isArray(onKey) ? onKey : [onKey];

    // Validate join keys exist in both DataFrames
    for (const key of joinKeys) {
      if (!this.columns.includes(key)) {
        throw new ColumnError(`Join key '${key}' not found in left DataFrame`, {
          operation: 'merge',
          columns: this.columns,
          requestedKey: key
        });
      }
      if (!otherDataFrame.columns.includes(key)) {
        throw new ColumnError(`Join key '${key}' not found in right DataFrame`, {
          operation: 'merge',
          columns: otherDataFrame.columns,
          requestedKey: key
        });
      }
    }

    // Validate join type
    const validJoinTypes = ['inner', 'left', 'right', 'outer'];
    if (!validJoinTypes.includes(how)) {
      throw new ValidationError(`Invalid join type '${how}'. Must be one of: ${validJoinTypes.join(', ')}`, {
        operation: 'merge',
        value: how
      });
    }

    // Validate suffixes
    if (!Array.isArray(suffixes) || suffixes.length !== 2) {
      throw new ValidationError('suffixes must be an array of exactly 2 strings', {
        operation: 'merge',
        value: suffixes
      });
    }

    // Get columns from both DataFrames, excluding join keys from the right DataFrame
    const leftColumns = this.columns;
    const rightColumnsToAdd = otherDataFrame.columns.filter(col => !joinKeys.includes(col));

    // Find conflicting columns (excluding join keys)
    const conflictingColumns = rightColumnsToAdd.filter(col => leftColumns.includes(col));

    // Build new column names - add suffixes to left columns that conflict
    const newColumns = [];
    for (const col of leftColumns) {
      if (conflictingColumns.includes(col)) {
        newColumns.push(col + suffixes[0]);
      } else {
        newColumns.push(col);
      }
    }
    
    // Add right columns with suffixes if they conflict
    for (const col of rightColumnsToAdd) {
      if (conflictingColumns.includes(col)) {
        newColumns.push(col + suffixes[1]);
      } else {
        newColumns.push(col);
      }
    }

    // Create maps for quick lookup
    const leftMap = new Map();
    const rightMap = new Map();

    // Build left map
    for (let i = 0; i < this.rows; i++) {
      const keyValues = joinKeys.map(key => this.getCell(i, key));
      const keyStr = JSON.stringify(keyValues);
      if (!leftMap.has(keyStr)) {
        leftMap.set(keyStr, []);
      }
      leftMap.get(keyStr).push(i);
    }

    // Build right map
    for (let i = 0; i < otherDataFrame.rows; i++) {
      const keyValues = joinKeys.map(key => otherDataFrame.getCell(i, key));
      const keyStr = JSON.stringify(keyValues);
      if (!rightMap.has(keyStr)) {
        rightMap.set(keyStr, []);
      }
      rightMap.get(keyStr).push(i);
    }

    // Helper function to build a merged row
    const buildMergedRow = (leftIdx, rightIdx) => {
      const leftRow = this.getRow(leftIdx);
      const rightRow = rightIdx !== null ? otherDataFrame.getRow(rightIdx) : null;
      const mergedRow = [];

      // Add left columns in order
      for (const col of leftColumns) {
        mergedRow.push(leftRow[col]);
      }

      // Add right columns
      for (const col of rightColumnsToAdd) {
        if (rightRow !== null) {
          mergedRow.push(rightRow[col]);
        } else {
          mergedRow.push(null);
        }
      }

      return mergedRow;
    };

    // Perform the join
    const mergedData = [];

    if (how === 'inner') {
      // Inner join: only matching keys
      for (const [keyStr, leftIndices] of leftMap.entries()) {
        if (rightMap.has(keyStr)) {
          const rightIndices = rightMap.get(keyStr);
          for (const leftIdx of leftIndices) {
            for (const rightIdx of rightIndices) {
              mergedData.push(buildMergedRow(leftIdx, rightIdx));
            }
          }
        }
      }
    } else if (how === 'left') {
      // Left join: all left rows, matching right rows
      for (let i = 0; i < this.rows; i++) {
        const keyValues = joinKeys.map(key => this.getCell(i, key));
        const keyStr = JSON.stringify(keyValues);

        if (rightMap.has(keyStr)) {
          const rightIndices = rightMap.get(keyStr);
          for (const rightIdx of rightIndices) {
            mergedData.push(buildMergedRow(i, rightIdx));
          }
        } else {
          mergedData.push(buildMergedRow(i, null));
        }
      }
    } else if (how === 'right') {
      // Right join: all right rows, matching left rows
      for (let i = 0; i < otherDataFrame.rows; i++) {
        const keyValues = joinKeys.map(key => otherDataFrame.getCell(i, key));
        const keyStr = JSON.stringify(keyValues);

        if (leftMap.has(keyStr)) {
          const leftIndices = leftMap.get(keyStr);
          for (const leftIdx of leftIndices) {
            mergedData.push(buildMergedRow(leftIdx, i));
          }
        } else {
          // Create a row with nulls for left columns
          const mergedRow = new Array(leftColumns.length).fill(null);
          const rightRow = otherDataFrame.getRow(i);
          for (const col of rightColumnsToAdd) {
            mergedRow.push(rightRow[col]);
          }
          mergedData.push(mergedRow);
        }
      }
    } else if (how === 'outer') {
      // Outer join: all rows from both DataFrames
      const processedKeys = new Set();

      // Process all left rows
      for (let i = 0; i < this.rows; i++) {
        const keyValues = joinKeys.map(key => this.getCell(i, key));
        const keyStr = JSON.stringify(keyValues);
        processedKeys.add(keyStr);

        if (rightMap.has(keyStr)) {
          const rightIndices = rightMap.get(keyStr);
          for (const rightIdx of rightIndices) {
            mergedData.push(buildMergedRow(i, rightIdx));
          }
        } else {
          mergedData.push(buildMergedRow(i, null));
        }
      }

      // Process right rows not in left
      for (const [keyStr, rightIndices] of rightMap.entries()) {
        if (!processedKeys.has(keyStr)) {
          for (const rightIdx of rightIndices) {
            const rightRow = otherDataFrame.getRow(rightIdx);
            const mergedRow = [];
            
            // Add left columns (with nulls for non-join-key columns)
            for (const col of leftColumns) {
              if (joinKeys.includes(col)) {
                // For join key columns, use the value from the right row
                mergedRow.push(rightRow[col]);
              } else {
                // For non-join-key columns, use null
                mergedRow.push(null);
              }
            }
            
            // Add right columns
            for (const col of rightColumnsToAdd) {
              mergedRow.push(rightRow[col]);
            }
            mergedData.push(mergedRow);
          }
        }
      }
    }

    // Return merged DataFrame
    return new NodeDataFrame(mergedData.length > 0 ? mergedData : [], newColumns);
  }

  /**
   * Concatenates multiple DataFrames vertically or horizontally.
   *
   * Stacks DataFrames either by rows (axis=0) or by columns (axis=1).
   * For vertical concatenation, columns are aligned by name.
   * For horizontal concatenation, rows are aligned by index.
   *
   * @static
   * @param {Array<NodeDataFrame>} dataFrames - Array of DataFrames to concatenate
   * @param {number} [axis=0] - Concatenation axis:
   *   - 0: Vertical (stack rows) - aligns columns by name
   *   - 1: Horizontal (stack columns) - aligns rows by index
   *
   * @returns {NodeDataFrame} A new concatenated DataFrame
   *
   * @throws {ValidationError} If dataFrames is not an array
   * @throws {ValidationError} If any element is not a DataFrame
   * @throws {ValidationError} If axis is not 0 or 1
   *
   * @example
   * // Vertical concatenation (stack rows)
   * const df1 = DataFrame(
   *   [[1, 'Rishikesh Agrawani'], [2, 'Hemkesh Agrawani']],
   *   ['id', 'name']
   * );
   * const df2 = DataFrame(
   *   [[3, 'Malinikesh Agrawani']],
   *   ['id', 'name']
   * );
   * const concatenated = DataFrame.concat([df1, df2], 0);
   * // Result: 3 rows with columns ['id', 'name']
   *
   * @example
   * // Horizontal concatenation (stack columns)
   * const df1 = DataFrame(
   *   [[1, 'Alice'], [2, 'Bob']],
   *   ['id', 'name']
   * );
   * const df2 = DataFrame(
   *   [[25, 'NY'], [30, 'LA']],
   *   ['age', 'city']
   * );
   * const concatenated = DataFrame.concat([df1, df2], 1);
   * // Result: 2 rows with columns ['id', 'name', 'age', 'city']
   */
  static concat(dataFrames, axis = 0) {
    // Validate inputs
    if (!Array.isArray(dataFrames)) {
      throw new ValidationError('dataFrames must be an array', {
        operation: 'concat',
        value: dataFrames
      });
    }

    if (dataFrames.length === 0) {
      return new NodeDataFrame([]);
    }

    // Validate all elements are DataFrames
    for (let i = 0; i < dataFrames.length; i++) {
      if (!(dataFrames[i] instanceof NodeDataFrame)) {
        throw new ValidationError(`Element at index ${i} is not a DataFrame instance`, {
          operation: 'concat',
          value: dataFrames[i]
        });
      }
    }

    // Validate axis
    if (axis !== 0 && axis !== 1) {
      throw new ValidationError('axis must be 0 (vertical) or 1 (horizontal)', {
        operation: 'concat',
        value: axis
      });
    }

    if (axis === 0) {
      // Vertical concatenation: stack rows
      // Collect all unique columns in order of appearance
      const allColumns = [];
      const columnSet = new Set();

      for (const df of dataFrames) {
        for (const col of df.columns) {
          if (!columnSet.has(col)) {
            allColumns.push(col);
            columnSet.add(col);
          }
        }
      }

      // If no columns, return empty DataFrame
      if (allColumns.length === 0) {
        return new NodeDataFrame([]);
      }

      // Concatenate rows
      const concatenatedData = [];
      for (const df of dataFrames) {
        for (let i = 0; i < df.rows; i++) {
          const row = df.getRow(i);
          const newRow = allColumns.map(col => row[col] !== undefined ? row[col] : null);
          concatenatedData.push(newRow);
        }
      }

      return new NodeDataFrame(concatenatedData, allColumns);
    } else {
      // Horizontal concatenation: stack columns
      // Filter out empty DataFrames
      const nonEmptyDataFrames = dataFrames.filter(df => df.rows > 0);
      
      // If all DataFrames are empty, return empty DataFrame
      if (nonEmptyDataFrames.length === 0) {
        return new NodeDataFrame([]);
      }
      
      // All non-empty DataFrames must have the same number of rows
      const numRows = nonEmptyDataFrames[0].rows;

      for (let i = 1; i < nonEmptyDataFrames.length; i++) {
        if (nonEmptyDataFrames[i].rows !== numRows) {
          throw new ValidationError(
            `All DataFrames must have the same number of rows for horizontal concatenation. ` +
            `DataFrame 0 has ${numRows} rows, DataFrame ${i} has ${nonEmptyDataFrames[i].rows} rows`,
            {
              operation: 'concat',
              axis: 1,
              expectedRows: numRows,
              actualRows: nonEmptyDataFrames[i].rows
            }
          );
        }
      }

      // Collect all columns
      const allColumns = [];
      for (const df of nonEmptyDataFrames) {
        allColumns.push(...df.columns);
      }

      // Concatenate columns
      const concatenatedData = [];
      for (let i = 0; i < numRows; i++) {
        const newRow = [];
        for (const df of nonEmptyDataFrames) {
          const row = df.getRow(i);
          for (const col of df.columns) {
            newRow.push(row[col]);
          }
        }
        concatenatedData.push(newRow);
      }

      return new NodeDataFrame(concatenatedData, allColumns);
    }
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

/**
 * Static method to concatenate multiple DataFrames.
 * 
 * @static
 * @param {Array<NodeDataFrame>} dataFrames - Array of DataFrames to concatenate
 * @param {number} [axis=0] - Concatenation axis (0 for vertical, 1 for horizontal)
 * @returns {NodeDataFrame} A new concatenated DataFrame
 */
DataFrame.concat = NodeDataFrame.concat;

// Exporting DataFrame so that it could be used by modules (i.e. they could import and use)
module.exports = DataFrame; 
