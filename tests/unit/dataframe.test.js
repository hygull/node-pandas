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
      const data = [[1, 'Alice', 25], [2, 'Bob', 30]];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      expect(df.columns).toEqual(columns);
      expect(df.rows).toBe(2);
      expect(df.cols).toBe(3);
      expect(df.index).toEqual([0, 1]);
    });

    test('should create a DataFrame without column names (auto-generated)', () => {
      const data = [[1, 'Alice'], [2, 'Bob']];
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
      const data = [[1, 'Alice', 25], [2, 'Bob', 30], [3, 'Charlie', 35]];
      const columns = ['id', 'name', 'age'];
      df = DataFrame(data, columns);
    });

    test('should return Series when accessing column by name', () => {
      const nameColumn = df.name;

      expect(nameColumn).toBeDefined();
      expect(nameColumn.length).toBe(3);
      expect(nameColumn[0]).toBe('Alice');
      expect(nameColumn[1]).toBe('Bob');
      expect(nameColumn[2]).toBe('Charlie');
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
      const data = [[1, 'Alice', 25], [2, 'Bob', 30], [3, 'Charlie', 35]];
      const columns = ['id', 'name', 'age'];
      df = DataFrame(data, columns);
    });

    test('should return row object with column names as keys', () => {
      const row = df.getRow(0);

      expect(row).toEqual({ id: 1, name: 'Alice', age: 25 });
    });

    test('should return correct row for any valid index', () => {
      const row1 = df.getRow(1);
      const row2 = df.getRow(2);

      expect(row1).toEqual({ id: 2, name: 'Bob', age: 30 });
      expect(row2).toEqual({ id: 3, name: 'Charlie', age: 35 });
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
    });
  });

  describe('Cell Access', () => {
    let df;

    beforeEach(() => {
      const data = [[1, 'Alice', 25], [2, 'Bob', 30], [3, 'Charlie', 35]];
      const columns = ['id', 'name', 'age'];
      df = DataFrame(data, columns);
    });

    test('should return correct cell value by row index and column name', () => {
      expect(df.getCell(0, 'id')).toBe(1);
      expect(df.getCell(0, 'name')).toBe('Alice');
      expect(df.getCell(0, 'age')).toBe(25);
    });

    test('should return correct values for all cells', () => {
      expect(df.getCell(1, 'id')).toBe(2);
      expect(df.getCell(1, 'name')).toBe('Bob');
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
      const data = [[1, 'Alice'], [2, 'Bob']];
      const columns = ['id', 'name'];
      const df = DataFrame(data, columns);

      // Mock console.table to verify it's called
      const consoleSpy = jest.spyOn(console, 'table').mockImplementation();

      df.show;

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should display data property', () => {
      const data = [[1, 'Alice'], [2, 'Bob']];
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
      const originalData = [[1, 'Alice', 25], [2, 'Bob', 30]];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(originalData, columns);

      // Verify data is preserved (data is stored in object format)
      expect(df.data[0]['id']).toBe(1);
      expect(df.data[0]['name']).toBe('Alice');
      expect(df.data[0]['age']).toBe(25);
      expect(df.data[1]['id']).toBe(2);
      expect(df.data[1]['name']).toBe('Bob');
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
      const data = [[1, 'Alice', 25]];
      const columns = ['id', 'name', 'age'];
      const df = DataFrame(data, columns);

      expect(df.rows).toBe(1);
      expect(df.cols).toBe(3);
      expect(df.getRow(0)).toEqual({ id: 1, name: 'Alice', age: 25 });
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
});
