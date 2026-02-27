/**
 * Unit tests for DataFrame class
 * Tests core functionality including creation, property access, row/cell access,
 * and error handling.
 * 
 * Validates: Requirements 1.2, 1.3, 1.4, 3.2, 3.3, 3.4, 13.1, 13.3
 */

const DataFrame = require('../../src/dataframe/dataframe');
const Series = require('../../src/series/series');
const { ValidationError, ColumnError, IndexError } = require('../../src/utils/errors');

describe('DataFrame Class', () => {
  describe('Constructor', () => {
    test('should create a DataFrame with explicit column names', () => {
      const data = [[1, 'Rishikesh Agrawani', 25], [2, 'Hemkesh Agrawani', 30]];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      expect(df.columns).toEqual(columns);
      expect(df.rows).toBe(2);
      expect(df.cols).toBe(3);
      expect(df.index).toEqual([0, 1]);
    });

    test('should create a DataFrame without column names (auto-generated)', () => {
      const data = [[1, 'Rishikesh Agrawani'], [2, 'Hemkesh Agrawani']];
      const df = DataFrame(data);

      expect(df.columns).toEqual(['0', '1']);
      expect(df.rows).toBe(2);
      expect(df.cols).toBe(2);
    });

    test('should create an empty DataFrame', () => {
      const df = DataFrame([]);

      expect(df.rows).toBe(0);
      expect(df.cols).toBe(0);
      expect(df.columns).toEqual([]);
    });

    test('should throw ValidationError for inconsistent row lengths', () => {
      const data = [[1, 2], [3]]; // Second row has different length
      const columns = ['a', 'b'];

      expect(() => DataFrame(data, columns)).toThrow(ValidationError);
    });

    test('should throw ValidationError for non-2D array data', () => {
      const data = [1, 2, 3]; // Not a 2D array

      expect(() => DataFrame(data)).toThrow(ValidationError);
    });

    test('should throw ValidationError for duplicate column names', () => {
      const data = [[1, 2], [3, 4]];
      const columns = ['id', 'id']; // Duplicate names

      expect(() => DataFrame(data, columns)).toThrow(ValidationError);
    });

    test('should throw ValidationError for column count mismatch', () => {
      const data = [[1, 2, 3], [4, 5, 6]];
      const columns = ['a', 'b']; // Only 2 columns but data has 3

      expect(() => DataFrame(data, columns)).toThrow(ValidationError);
    });

    test('should throw ValidationError for non-string column names', () => {
      const data = [[1, 2], [3, 4]];
      const columns = ['id', 123]; // Second column name is not a string

      expect(() => DataFrame(data, columns)).toThrow(ValidationError);
    });
  });

  describe('Properties', () => {
    let df;

    beforeEach(() => {
      const data = [[1, 'Alice', 25], [2, 'Bob', 30], [3, 'Charlie', 35]];
      const columns = ['id', 'name', 'age'];
      df = DataFrame(data, columns);
    });

    test('should have correct columns property', () => {
      expect(df.columns).toEqual(['id', 'name', 'age']);
    });

    test('should have correct index property', () => {
      expect(df.index).toEqual([0, 1, 2]);
    });

    test('should have correct rows property', () => {
      expect(df.rows).toBe(3);
    });

    test('should have correct cols property', () => {
      expect(df.cols).toBe(3);
    });

    test('should have consistent properties', () => {
      expect(df.index.length).toBe(df.rows);
      expect(df.columns.length).toBe(df.cols);
    });

    test('should have data property', () => {
      expect(df.data).toBeDefined();
      expect(Array.isArray(df.data)).toBe(true);
      expect(df.data.length).toBe(3);
    });
  });

  describe('Column Access', () => {
    let df;

    beforeEach(() => {
      const data = [[1, 'Rishikesh Agrawani', 25], [2, 'Hemkesh Agrawani', 30], [3, 'Malinikesh Agrawani', 35]];
      const columns = ['id', 'name', 'age'];
      df = DataFrame(data, columns);
    });

    test('should return Series when accessing column by name', () => {
      const nameColumn = df.name;

      expect(nameColumn).toBeDefined();
      expect(nameColumn.length).toBe(3);
      expect(nameColumn[0]).toBe('Rishikesh Agrawani');
      expect(nameColumn[1]).toBe('Hemkesh Agrawani');
      expect(nameColumn[2]).toBe('Malinikesh Agrawani');
    });

    test('should return Series when accessing column by bracket notation', () => {
      const idColumn = df['id'];

      expect(idColumn).toBeDefined();
      expect(idColumn.length).toBe(3);
      expect(idColumn[0]).toBe(1);
      expect(idColumn[1]).toBe(2);
      expect(idColumn[2]).toBe(3);
    });

    test('should cache Series objects for performance', () => {
      const nameColumn1 = df.name;
      const nameColumn2 = df.name;

      // Both should reference the same cached data
      expect(nameColumn1[0]).toBe(nameColumn2[0]);
    });

    test('should return Series for all columns', () => {
      const idSeries = df.id;
      const nameSeries = df.name;
      const ageSeries = df.age;

      expect(idSeries.length).toBe(3);
      expect(nameSeries.length).toBe(3);
      expect(ageSeries.length).toBe(3);
    });
  });

  describe('Row Access', () => {
    let df;

    beforeEach(() => {
      const data = [[1, 'Rishikesh Agrawani', 25], [2, 'Hemkesh Agrawani', 30], [3, 'Malinikesh Agrawani', 35]];
      const columns = ['id', 'name', 'age'];
      df = DataFrame(data, columns);
    });

    test('should return row object with column names as keys', () => {
      const row = df.getRow(0);

      expect(row).toEqual({ id: 1, name: 'Rishikesh Agrawani', age: 25 });
    });

    test('should return correct row for any valid index', () => {
      const row1 = df.getRow(1);
      const row2 = df.getRow(2);

      expect(row1).toEqual({ id: 2, name: 'Hemkesh Agrawani', age: 30 });
      expect(row2).toEqual({ id: 3, name: 'Malinikesh Agrawani', age: 35 });
    });

    test('should throw IndexError for negative row index', () => {
      expect(() => df.getRow(-1)).toThrow(IndexError);
    });

    test('should throw IndexError for row index out of bounds', () => {
      expect(() => df.getRow(10)).toThrow(IndexError);
    });

    test('should throw IndexError for non-integer row index', () => {
      expect(() => df.getRow('invalid')).toThrow();
    });

    test('should return row with all columns', () => {
      const row = df.getRow(0);
      const keys = Object.keys(row);

      expect(keys).toEqual(['id', 'name', 'age']);
      expect(keys.length).toBe(df.cols);
      expect(row.name).toBe('Rishikesh Agrawani');
    });
  });

  describe('Cell Access', () => {
    let df;

    beforeEach(() => {
      const data = [[1, 'Rishikesh Agrawani', 25], [2, 'Hemkesh Agrawani', 30], [3, 'Malinikesh Agrawani', 35]];
      const columns = ['id', 'name', 'age'];
      df = DataFrame(data, columns);
    });

    test('should return correct cell value by row index and column name', () => {
      expect(df.getCell(0, 'id')).toBe(1);
      expect(df.getCell(0, 'name')).toBe('Rishikesh Agrawani');
      expect(df.getCell(0, 'age')).toBe(25);
    });

    test('should return correct values for all cells', () => {
      expect(df.getCell(1, 'id')).toBe(2);
      expect(df.getCell(1, 'name')).toBe('Hemkesh Agrawani');
      expect(df.getCell(2, 'age')).toBe(35);
    });

    test('should throw IndexError for invalid row index', () => {
      expect(() => df.getCell(10, 'id')).toThrow(IndexError);
    });

    test('should throw ColumnError for non-existent column', () => {
      expect(() => df.getCell(0, 'nonexistent')).toThrow(ColumnError);
    });

    test('should throw IndexError for negative row index', () => {
      expect(() => df.getCell(-1, 'id')).toThrow(IndexError);
    });

    test('should handle null and undefined values in cells', () => {
      const data = [[1, null], [2, undefined]];
      const columns = ['id', 'value'];
      const df2 = DataFrame(data, columns);

      expect(df2.getCell(0, 'value')).toBeNull();
      expect(df2.getCell(1, 'value')).toBeUndefined();
    });
  });

  describe('Show Property', () => {
    test('should display DataFrame without errors', () => {
      const data = [[1, 'Rishikesh Agrawani'], [2, 'Hemkesh Agrawani']];
      const columns = ['id', 'name'];
      const df = DataFrame(data, columns);

      // Mock console.table to verify it's called
      const consoleSpy = jest.spyOn(console, 'table').mockImplementation();

      df.show;

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should display data property', () => {
      const data = [[1, 'Rishikesh Agrawani'], [2, 'Hemkesh Agrawani']];
      const columns = ['id', 'name'];
      const df = DataFrame(data, columns);

      const consoleSpy = jest.spyOn(console, 'table').mockImplementation();

      df.show;

      expect(consoleSpy).toHaveBeenCalledWith(df.data);
      consoleSpy.mockRestore();
    });
  });

  describe('Data Preservation', () => {
    test('should preserve data structure after creation', () => {
      const originalData = [[1, 'Rishikesh Agrawani', 25], [2, 'Hemkesh Agrawani', 30]];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(originalData, columns);

      // Verify data is preserved (data is stored in object format)
      expect(df.data[0]['id']).toBe(1);
      expect(df.data[0]['name']).toBe('Rishikesh Agrawani');
      expect(df.data[0]['age']).toBe(25);
      expect(df.data[1]['id']).toBe(2);
      expect(df.data[1]['name']).toBe('Hemkesh Agrawani');
      expect(df.data[1]['age']).toBe(30);
    });

    test('should preserve data types', () => {
      const data = [[1, 'text', true, null, 3.14]];
      const columns = ['int', 'string', 'bool', 'null', 'float'];
      const df = DataFrame(data, columns);

      expect(typeof df.getCell(0, 'int')).toBe('number');
      expect(typeof df.getCell(0, 'string')).toBe('string');
      expect(typeof df.getCell(0, 'bool')).toBe('boolean');
      expect(df.getCell(0, 'null')).toBeNull();
      expect(typeof df.getCell(0, 'float')).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    test('should handle single row DataFrame', () => {
      const data = [[1, 'Rishikesh Agrawani', 25]];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      expect(df.rows).toBe(1);
      expect(df.cols).toBe(3);
      expect(df.getRow(0)).toEqual({ id: 1, name: 'Rishikesh Agrawani', age: 25 });
    });

    test('should handle single column DataFrame', () => {
      const data = [[1], [2], [3]];
      const columns = ['id'];
      const df = DataFrame(data, columns);

      expect(df.rows).toBe(3);
      expect(df.cols).toBe(1);
      expect(df.getCell(0, 'id')).toBe(1);
    });

    test('should handle DataFrame with mixed data types', () => {
      const data = [[1, 'text', true], [2, 'more', false]];
      const columns = ['num', 'str', 'bool'];
      const df = DataFrame(data, columns);

      expect(df.getCell(0, 'num')).toBe(1);
      expect(df.getCell(0, 'str')).toBe('text');
      expect(df.getCell(0, 'bool')).toBe(true);
    });

    test('should handle DataFrame with special characters in column names', () => {
      const data = [[1, 2], [3, 4]];
      const columns = ['col-1', 'col_2'];
      const df = DataFrame(data, columns);

      expect(df.columns).toEqual(['col-1', 'col_2']);
      expect(df.getCell(0, 'col-1')).toBe(1);
    });

    test('should handle DataFrame with numeric strings', () => {
      const data = [['123', '456'], ['789', '012']];
      const columns = ['a', 'b'];
      const df = DataFrame(data, columns);

      expect(df.getCell(0, 'a')).toBe('123');
      expect(df.getCell(0, 'b')).toBe('456');
    });
  });

  describe('Array-like Behavior', () => {
    test('should extend Array class', () => {
      const data = [[1, 'Alice'], [2, 'Bob']];
      const columns = ['id', 'name'];
      const df = DataFrame(data, columns);

      expect(df instanceof Array).toBe(true);
    });

    test('should have array length', () => {
      const data = [[1, 'Alice'], [2, 'Bob'], [3, 'Charlie']];
      const columns = ['id', 'name'];
      const df = DataFrame(data, columns);

      expect(df.length).toBe(3);
    });

    test('should support array indexing', () => {
      const data = [[1, 'Alice'], [2, 'Bob']];
      const columns = ['id', 'name'];
      const df = DataFrame(data, columns);

      expect(df[0]).toEqual([1, 'Alice']);
      expect(df[1]).toEqual([2, 'Bob']);
    });
  });

  describe('Select Method', () => {
    let df;

    beforeEach(() => {
      const data = [
        [1, 'Rishikesh Agrawani', 25, true],
        [2, 'Hemkesh Agrawani', 30, false],
        [3, 'Malinikesh Agrawani', 35, true]
      ];
      const columns = ['id', 'name', 'age', 'active'];
      df = DataFrame(data, columns);
    });

    test('should select a single column', () => {
      const result = df.select(['id']);

      expect(result.cols).toBe(1);
      expect(result.rows).toBe(3);
      expect(result.columns).toEqual(['id']);
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(1, 'id')).toBe(2);
      expect(result.getCell(2, 'id')).toBe(3);
    });

    test('should select multiple columns', () => {
      const result = df.select(['id', 'name']);

      expect(result.cols).toBe(2);
      expect(result.rows).toBe(3);
      expect(result.columns).toEqual(['id', 'name']);
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(0, 'name')).toBe('Rishikesh Agrawani');
      expect(result.getCell(1, 'id')).toBe(2);
      expect(result.getCell(1, 'name')).toBe('Hemkesh Agrawani');
    });

    test('should select columns in specified order', () => {
      const result = df.select(['name', 'id', 'age']);

      expect(result.columns).toEqual(['name', 'id', 'age']);
      expect(result.getCell(0, 'name')).toBe('Rishikesh Agrawani');
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(0, 'age')).toBe(25);
    });

    test('should throw ColumnError for non-existent column', () => {
      expect(() => df.select(['nonexistent'])).toThrow(ColumnError);
    });

    test('should throw ColumnError when one of multiple columns does not exist', () => {
      expect(() => df.select(['id', 'nonexistent', 'name'])).toThrow(ColumnError);
    });

    test('should throw ValidationError for non-array input', () => {
      expect(() => df.select('id')).toThrow(ValidationError);
    });

    test('should throw ValidationError for null input', () => {
      expect(() => df.select(null)).toThrow(ValidationError);
    });

    test('should throw ValidationError for undefined input', () => {
      expect(() => df.select(undefined)).toThrow(ValidationError);
    });

    test('should handle empty selection array', () => {
      const result = df.select([]);

      expect(result.cols).toBe(0);
      expect(result.rows).toBe(3);
      expect(result.columns).toEqual([]);
    });

    test('should preserve data types in selected columns', () => {
      const result = df.select(['id', 'name', 'age', 'active']);

      expect(typeof result.getCell(0, 'id')).toBe('number');
      expect(typeof result.getCell(0, 'name')).toBe('string');
      expect(typeof result.getCell(0, 'age')).toBe('number');
      expect(typeof result.getCell(0, 'active')).toBe('boolean');
    });

    test('should preserve row order in selected columns', () => {
      const result = df.select(['id', 'name']);

      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(1, 'id')).toBe(2);
      expect(result.getCell(2, 'id')).toBe(3);
      expect(result.getCell(0, 'name')).toBe('Rishikesh Agrawani');
      expect(result.getCell(1, 'name')).toBe('Hemkesh Agrawani');
      expect(result.getCell(2, 'name')).toBe('Malinikesh Agrawani');
    });

    test('should maintain index in selected DataFrame', () => {
      const result = df.select(['id', 'name']);

      expect(result.index).toEqual([0, 1, 2]);
      expect(result.rows).toBe(3);
    });

    test('should return new DataFrame instance', () => {
      const result = df.select(['id', 'name']);

      expect(result).not.toBe(df);
      expect(result instanceof Array).toBe(true);
    });

    test('should select all columns when all column names provided', () => {
      const result = df.select(['id', 'name', 'age', 'active']);

      expect(result.cols).toBe(4);
      expect(result.rows).toBe(3);
      expect(result.columns).toEqual(['id', 'name', 'age', 'active']);
    });

    test('should handle DataFrame with null values in selected columns', () => {
      const data = [[1, null], [2, 'Hemkesh Agrawani'], [3, null]];
      const columns = ['id', 'name'];
      const df2 = DataFrame(data, columns);

      const result = df2.select(['id', 'name']);

      expect(result.getCell(0, 'name')).toBeNull();
      expect(result.getCell(1, 'name')).toBe('Hemkesh Agrawani');
      expect(result.getCell(2, 'name')).toBeNull();
    });

    test('should handle DataFrame with undefined values in selected columns', () => {
      const data = [[1, undefined], [2, 'Hemkesh Agrawani'], [3, undefined]];
      const columns = ['id', 'name'];
      const df2 = DataFrame(data, columns);

      const result = df2.select(['id', 'name']);

      expect(result.getCell(0, 'name')).toBeUndefined();
      expect(result.getCell(1, 'name')).toBe('Hemkesh Agrawani');
      expect(result.getCell(2, 'name')).toBeUndefined();
    });

    test('should work with single row DataFrame', () => {
      const data = [[1, 'Rishikesh Agrawani', 25, true]];
      const columns = ['id', 'name', 'age', 'active'];
      const df2 = DataFrame(data, columns);

      const result = df2.select(['id', 'name']);

      expect(result.rows).toBe(1);
      expect(result.cols).toBe(2);
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(0, 'name')).toBe('Rishikesh Agrawani');
    });

    test('should work with single column DataFrame', () => {
      const data = [[1], [2], [3]];
      const columns = ['id'];
      const df2 = DataFrame(data, columns);

      const result = df2.select(['id']);

      expect(result.rows).toBe(3);
      expect(result.cols).toBe(1);
      expect(result.columns).toEqual(['id']);
    });

    test('should preserve numeric data types correctly', () => {
      const data = [[1, 2.5], [3, 4.7], [5, 6.2]];
      const columns = ['int_col', 'float_col'];
      const df2 = DataFrame(data, columns);

      const result = df2.select(['int_col', 'float_col']);

      expect(result.getCell(0, 'int_col')).toBe(1);
      expect(result.getCell(0, 'float_col')).toBe(2.5);
      expect(result.getCell(1, 'float_col')).toBe(4.7);
    });

    test('should preserve string data types correctly', () => {
      const data = [['Kendrick Lamar', 'Dooj Sahu'], ['Brinston Jones', 'Malinikesh Agrawani']];
      const columns = ['col1', 'col2'];
      const df2 = DataFrame(data, columns);

      const result = df2.select(['col1', 'col2']);

      expect(result.getCell(0, 'col1')).toBe('Kendrick Lamar');
      expect(result.getCell(0, 'col2')).toBe('Dooj Sahu');
      expect(result.getCell(1, 'col1')).toBe('Brinston Jones');
    });

    test('should preserve boolean data types correctly', () => {
      const data = [[true, false], [false, true]];
      const columns = ['bool1', 'bool2'];
      const df2 = DataFrame(data, columns);

      const result = df2.select(['bool1', 'bool2']);

      expect(result.getCell(0, 'bool1')).toBe(true);
      expect(result.getCell(0, 'bool2')).toBe(false);
      expect(result.getCell(1, 'bool1')).toBe(false);
    });

    test('should handle case-sensitive column names', () => {
      const data = [[1, 2], [3, 4]];
      const columns = ['ID', 'Name'];
      const df2 = DataFrame(data, columns);

      const result = df2.select(['ID']);

      expect(result.columns).toEqual(['ID']);
      expect(result.getCell(0, 'ID')).toBe(1);
    });

    test('should throw error for case mismatch in column names', () => {
      const data = [[1, 2], [3, 4]];
      const columns = ['ID', 'Name'];
      const df2 = DataFrame(data, columns);

      expect(() => df2.select(['id'])).toThrow(ColumnError);
    });
  });

  describe('Filter Method', () => {
    let df;

    beforeEach(() => {
      const data = [
        [1, 'Rishikesh Agrawani', 32],
        [2, 'Hemkesh Agrawani', 30],
        [3, 'Malinikesh Agrawani', 28]
      ];
      const columns = ['id', 'name', 'age'];
      df = DataFrame(data, columns);
    });

    test('should filter rows based on numeric condition', () => {
      const result = df.filter(row => row.age > 29);

      expect(result.rows).toBe(2);
      expect(result.cols).toBe(3);
      expect(result.columns).toEqual(['id', 'name', 'age']);
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(0, 'age')).toBe(32);
      expect(result.getCell(1, 'id')).toBe(2);
      expect(result.getCell(1, 'age')).toBe(30);
    });

    test('should filter rows based on string condition', () => {
      const result = df.filter(row => row.name.includes('Agrawani'));

      expect(result.rows).toBe(3);
      expect(result.getCell(0, 'name')).toBe('Rishikesh Agrawani');
      expect(result.getCell(1, 'name')).toBe('Hemkesh Agrawani');
      expect(result.getCell(2, 'name')).toBe('Malinikesh Agrawani');
    });

    test('should filter rows with exact match condition', () => {
      const result = df.filter(row => row.age === 28);

      expect(result.rows).toBe(1);
      expect(result.getCell(0, 'id')).toBe(3);
      expect(result.getCell(0, 'name')).toBe('Malinikesh Agrawani');
      expect(result.getCell(0, 'age')).toBe(28);
    });

    test('should return empty DataFrame when no rows match', () => {
      const result = df.filter(row => row.age > 100);

      expect(result.rows).toBe(0);
      expect(result.cols).toBe(3);
      expect(result.columns).toEqual(['id', 'name', 'age']);
    });

    test('should return all rows when condition matches all', () => {
      const result = df.filter(row => row.age > 0);

      expect(result.rows).toBe(3);
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(1, 'id')).toBe(2);
      expect(result.getCell(2, 'id')).toBe(3);
    });

    test('should support chaining multiple filters', () => {
      const result = df.filter(row => row.age > 28).filter(row => row.id < 3);

      expect(result.rows).toBe(2);
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(0, 'age')).toBe(32);
      expect(result.getCell(1, 'id')).toBe(2);
      expect(result.getCell(1, 'age')).toBe(30);
    });

    test('should support chaining three or more filters', () => {
      const result = df
        .filter(row => row.age > 25)
        .filter(row => row.id > 0)
        .filter(row => row.age < 35);

      expect(result.rows).toBe(3);
    });

    test('should preserve data types in filtered DataFrame', () => {
      const result = df.filter(row => row.age > 28);

      expect(typeof result.getCell(0, 'id')).toBe('number');
      expect(typeof result.getCell(0, 'name')).toBe('string');
      expect(typeof result.getCell(0, 'age')).toBe('number');
    });

    test('should preserve row order in filtered DataFrame', () => {
      const result = df.filter(row => row.age > 28);

      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(1, 'id')).toBe(2);
    });

    test('should return new DataFrame instance', () => {
      const result = df.filter(row => row.age > 29);

      expect(result).not.toBe(df);
      expect(result instanceof Array).toBe(true);
    });

    test('should throw ValidationError for non-function condition', () => {
      expect(() => df.filter('not a function')).toThrow(ValidationError);
    });

    test('should throw ValidationError for null condition', () => {
      expect(() => df.filter(null)).toThrow(ValidationError);
    });

    test('should throw ValidationError for undefined condition', () => {
      expect(() => df.filter(undefined)).toThrow(ValidationError);
    });

    test('should handle filter with non-existent column gracefully', () => {
      // When accessing a non-existent column, it returns undefined
      // The condition will evaluate but won't throw an error
      const result = df.filter(row => row.nonexistent === undefined);

      // All rows should match because nonexistent is undefined for all
      expect(result.rows).toBe(3);
    });

    test('should handle complex filter conditions', () => {
      const result = df.filter(row => row.age > 28 && row.id < 3);

      expect(result.rows).toBe(2);
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(1, 'id')).toBe(2);
    });

    test('should handle OR conditions in filter', () => {
      const result = df.filter(row => row.id === 1 || row.id === 3);

      expect(result.rows).toBe(2);
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(1, 'id')).toBe(3);
    });

    test('should handle NOT conditions in filter', () => {
      const result = df.filter(row => !(row.id === 2));

      expect(result.rows).toBe(2);
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(1, 'id')).toBe(3);
    });

    test('should handle filter with null values', () => {
      const data = [[1, 'Alice', null], [2, 'Bob', 30], [3, 'Charlie', 25]];
      const columns = ['id', 'name', 'age'];
      const df2 = DataFrame(data, columns);

      const result = df2.filter(row => row.age !== null && row.age > 24);

      expect(result.rows).toBe(2);
      expect(result.getCell(0, 'id')).toBe(2);
      expect(result.getCell(1, 'id')).toBe(3);
    });

    test('should handle filter with undefined values', () => {
      const data = [[1, 'Alice', undefined], [2, 'Bob', 30], [3, 'Charlie', 25]];
      const columns = ['id', 'name', 'age'];
      const df2 = DataFrame(data, columns);

      const result = df2.filter(row => row.age !== undefined && row.age > 24);

      expect(result.rows).toBe(2);
      expect(result.getCell(0, 'id')).toBe(2);
      expect(result.getCell(1, 'id')).toBe(3);
    });

    test('should handle single row DataFrame filter', () => {
      const data = [[1, 'Alice', 25]];
      const columns = ['id', 'name', 'age'];
      const df2 = DataFrame(data, columns);

      const result = df2.filter(row => row.age > 20);

      expect(result.rows).toBe(1);
      expect(result.getCell(0, 'id')).toBe(1);
    });

    test('should handle filter on DataFrame with mixed data types', () => {
      const data = [[1, 'text', true], [2, 'more', false], [3, 'data', true]];
      const columns = ['num', 'str', 'bool'];
      const df2 = DataFrame(data, columns);

      const result = df2.filter(row => row.bool === true);

      expect(result.rows).toBe(2);
      expect(result.getCell(0, 'num')).toBe(1);
      expect(result.getCell(1, 'num')).toBe(3);
    });

    test('should maintain index property in filtered DataFrame', () => {
      const result = df.filter(row => row.age > 28);

      expect(result.index).toEqual([0, 1]);
      expect(result.rows).toBe(2);
    });

    test('should handle chained filters that result in empty DataFrame', () => {
      const result = df
        .filter(row => row.age > 30)
        .filter(row => row.age < 30);

      expect(result.rows).toBe(0);
      expect(result.cols).toBe(3);
      expect(result.columns).toEqual(['id', 'name', 'age']);
    });

    test('should handle filter with string comparison', () => {
      const result = df.filter(row => row.name > 'Hemkesh Agrawani');

      // String comparison: 'Rishikesh Agrawani' > 'Hemkesh Agrawani' is true
      // 'Malinikesh Agrawani' > 'Hemkesh Agrawani' is true
      expect(result.rows).toBe(2);
      expect(result.getCell(0, 'name')).toBe('Rishikesh Agrawani');
      expect(result.getCell(1, 'name')).toBe('Malinikesh Agrawani');
    });

    test('should handle filter with multiple column references', () => {
      const result = df.filter(row => row.id + row.age > 30);

      // 1 + 32 = 33 > 30 ✓
      // 2 + 30 = 32 > 30 ✓
      // 3 + 28 = 31 > 30 ✓
      expect(result.rows).toBe(3);
    });
  });

  describe('GroupBy Method', () => {
    let df;

    beforeEach(() => {
      const data = [
        [1, 'Rishikesh Agrawani', 32, 'Engineering'],
        [2, 'Hemkesh Agrawani', 30, 'Sales'],
        [3, 'Malinikesh Agrawani', 28, 'Engineering']
      ];
      const columns = ['id', 'name', 'age', 'department'];
      df = DataFrame(data, columns);
    });

    test('should return GroupBy object for single column', () => {
      const grouped = df.groupBy('department');

      expect(grouped).toBeDefined();
      expect(grouped.constructor.name).toBe('GroupBy');
    });

    test('should return GroupBy object for multiple columns', () => {
      const grouped = df.groupBy(['department', 'name']);

      expect(grouped).toBeDefined();
      expect(grouped.constructor.name).toBe('GroupBy');
    });

    test('should throw ColumnError for non-existent column', () => {
      expect(() => df.groupBy('nonexistent')).toThrow(ColumnError);
    });

    test('should throw ValidationError for invalid grouping columns', () => {
      expect(() => df.groupBy(123)).toThrow(ValidationError);
    });
  });

  describe('GroupBy Aggregation - Single Column', () => {
    let df;

    beforeEach(() => {
      const data = [
        [1, 'Rishikesh Agrawani', 32, 'Engineering'],
        [2, 'Hemkesh Agrawani', 30, 'Sales'],
        [3, 'Malinikesh Agrawani', 28, 'Engineering']
      ];
      const columns = ['id', 'name', 'age', 'department'];
      df = DataFrame(data, columns);
    });

    test('should compute mean by group', () => {
      const result = df.groupBy('department').mean();

      expect(result.rows).toBe(2);
      expect(result.columns).toContain('department');
      expect(result.columns).toContain('id');
      expect(result.columns).toContain('age');

      // Engineering group: ids [1, 3], ages [32, 28]
      const engRow = result.data.find(row => row.department === 'Engineering');
      expect(engRow.id).toBe(2); // (1 + 3) / 2
      expect(engRow.age).toBe(30); // (32 + 28) / 2

      // Sales group: ids [2], ages [30]
      const salesRow = result.data.find(row => row.department === 'Sales');
      expect(salesRow.id).toBe(2);
      expect(salesRow.age).toBe(30);
    });

    test('should compute sum by group', () => {
      const result = df.groupBy('department').sum();

      expect(result.rows).toBe(2);

      const engRow = result.data.find(row => row.department === 'Engineering');
      expect(engRow.id).toBe(4); // 1 + 3
      expect(engRow.age).toBe(60); // 32 + 28

      const salesRow = result.data.find(row => row.department === 'Sales');
      expect(salesRow.id).toBe(2);
      expect(salesRow.age).toBe(30);
    });

    test('should compute count by group', () => {
      const result = df.groupBy('department').count();

      expect(result.rows).toBe(2);
      expect(result.columns).toContain('department');
      expect(result.columns).toContain('count');

      const engRow = result.data.find(row => row.department === 'Engineering');
      expect(engRow.count).toBe(2);

      const salesRow = result.data.find(row => row.department === 'Sales');
      expect(salesRow.count).toBe(1);
    });

    test('should compute min by group', () => {
      const result = df.groupBy('department').min();

      expect(result.rows).toBe(2);

      const engRow = result.data.find(row => row.department === 'Engineering');
      expect(engRow.id).toBe(1);
      expect(engRow.age).toBe(28);

      const salesRow = result.data.find(row => row.department === 'Sales');
      expect(salesRow.id).toBe(2);
      expect(salesRow.age).toBe(30);
    });

    test('should compute max by group', () => {
      const result = df.groupBy('department').max();

      expect(result.rows).toBe(2);

      const engRow = result.data.find(row => row.department === 'Engineering');
      expect(engRow.id).toBe(3);
      expect(engRow.age).toBe(32);

      const salesRow = result.data.find(row => row.department === 'Sales');
      expect(salesRow.id).toBe(2);
      expect(salesRow.age).toBe(30);
    });

    test('should compute std by group', () => {
      const result = df.groupBy('department').std();

      expect(result.rows).toBe(2);

      const engRow = result.data.find(row => row.department === 'Engineering');
      // std of [1, 3] = sqrt(2) ≈ 1.414
      // std of [32, 28] = sqrt(8) ≈ 2.828
      expect(engRow.id).toBeCloseTo(Math.sqrt(2), 2);
      expect(engRow.age).toBeCloseTo(Math.sqrt(8), 2);

      const salesRow = result.data.find(row => row.department === 'Sales');
      // Single value, std should be null
      expect(salesRow.id).toBeNull();
      expect(salesRow.age).toBeNull();
    });

    test('should exclude non-numeric values from aggregation', () => {
      const data = [
        [1, 'Alice', 25, 'A'],
        [2, 'Bob', 30, 'A'],
        [3, 'Charlie', 35, 'B']
      ];
      const columns = ['id', 'name', 'age', 'group'];
      const df2 = DataFrame(data, columns);

      const result = df2.groupBy('group').mean();

      // Should include all columns but only compute aggregations for numeric ones
      expect(result.columns).toContain('id');
      expect(result.columns).toContain('age');
      expect(result.columns).toContain('name');
      expect(result.columns).toContain('group');
      
      // Check that name column has null values (not aggregated)
      const groupA = result.data.find(r => r.group === 'A');
      expect(groupA.name).toBeNull();
    });

    test('should handle groups with single row', () => {
      const result = df.groupBy('department').mean();

      const salesRow = result.data.find(row => row.department === 'Sales');
      expect(salesRow.id).toBe(2);
      expect(salesRow.age).toBe(30);
    });
  });

  describe('GroupBy Aggregation - Multiple Columns', () => {
    let df;

    beforeEach(() => {
      const data = [
        [1, 'Rishikesh Agrawani', 32, 'Engineering'],
        [2, 'Hemkesh Agrawani', 30, 'Sales'],
        [3, 'Malinikesh Agrawani', 28, 'Engineering'],
        [4, 'Rishikesh Agrawani', 32, 'Sales']
      ];
      const columns = ['id', 'name', 'age', 'department'];
      df = DataFrame(data, columns);
    });

    test('should create hierarchical groups for multiple columns', () => {
      const result = df.groupBy(['department', 'name']).count();

      expect(result.rows).toBe(4);
      expect(result.columns).toContain('department');
      expect(result.columns).toContain('name');
      expect(result.columns).toContain('count');
    });

    test('should compute aggregations for multi-column groups', () => {
      const result = df.groupBy(['department', 'name']).mean();

      expect(result.rows).toBe(4);

      // Find the row for Engineering + Rishikesh Agrawani
      const row = result.data.find(
        r => r.department === 'Engineering' && r.name === 'Rishikesh Agrawani'
      );
      expect(row).toBeDefined();
      expect(row.id).toBe(1);
      expect(row.age).toBe(32);
    });

    test('should compute count for multi-column groups', () => {
      const result = df.groupBy(['department', 'name']).count();

      // Rishikesh Agrawani appears in both Engineering and Sales
      const engRow = result.data.find(
        r => r.department === 'Engineering' && r.name === 'Rishikesh Agrawani'
      );
      expect(engRow.count).toBe(1);

      const salesRow = result.data.find(
        r => r.department === 'Sales' && r.name === 'Rishikesh Agrawani'
      );
      expect(salesRow.count).toBe(1);
    });
  });

  describe('GroupBy Edge Cases', () => {
    test('should handle empty DataFrame', () => {
      // Create a DataFrame with data, then filter to empty
      const data = [
        [1, 'Alice', 25, 'A'],
        [2, 'Bob', 30, 'B']
      ];
      const columns = ['id', 'name', 'age', 'group'];
      const df = DataFrame(data, columns);
      
      // Filter to empty DataFrame
      const emptyDf = df.filter(row => row.id > 100);
      const result = emptyDf.groupBy('group').count();

      expect(result.rows).toBe(0);
      expect(result.columns).toContain('group');
      expect(result.columns).toContain('count');
    });

    test('should handle single row DataFrame', () => {
      const data = [[1, 'Alice', 25, 'A']];
      const columns = ['id', 'name', 'age', 'group'];
      const df = DataFrame(data, columns);

      const result = df.groupBy('group').mean();

      expect(result.rows).toBe(1);
      expect(result.getCell(0, 'id')).toBe(1);
      expect(result.getCell(0, 'age')).toBe(25);
    });

    test('should handle all rows in same group', () => {
      const data = [
        [1, 'Alice', 25, 'A'],
        [2, 'Bob', 30, 'A'],
        [3, 'Charlie', 35, 'A']
      ];
      const columns = ['id', 'name', 'age', 'group'];
      const df = DataFrame(data, columns);

      const result = df.groupBy('group').mean();

      expect(result.rows).toBe(1);
      expect(result.getCell(0, 'id')).toBe(2); // (1 + 2 + 3) / 3
      expect(result.getCell(0, 'age')).toBe(30); // (25 + 30 + 35) / 3
    });

    test('should handle null values in grouping column', () => {
      const data = [
        [1, 'Alice', 25, 'A'],
        [2, 'Bob', 30, null],
        [3, 'Charlie', 35, 'A']
      ];
      const columns = ['id', 'name', 'age', 'group'];
      const df = DataFrame(data, columns);

      const result = df.groupBy('group').count();

      // Should have 2 groups: 'A' and 'null'
      expect(result.rows).toBe(2);
    });

    test('should handle numeric group keys', () => {
      const data = [
        [1, 'Alice', 25, 1],
        [2, 'Bob', 30, 2],
        [3, 'Charlie', 35, 1]
      ];
      const columns = ['id', 'name', 'age', 'group'];
      const df = DataFrame(data, columns);

      const result = df.groupBy('group').mean();

      expect(result.rows).toBe(2);
      // Group keys are stored as strings in the result
      const group1 = result.data.find(r => String(r.group) === '1');
      expect(group1).toBeDefined();
      expect(group1.id).toBe(2); // (1 + 3) / 2
    });
  });
});

