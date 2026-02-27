/**
 * Unit tests for Series class
 * Tests Series creation, iteration, statistical methods, and transformations
 * 
 * Validates: Requirements 13.1, 13.3
 */

const Series = require('../../src/series/series');
const { DataFrameError, OperationError, TypeError: TypeErrorClass } = require('../../src/utils/errors');

describe('Series Class', () => {
  describe('Creation and Basic Properties', () => {
    test('should create a Series from an array', () => {
      const data = [1, 2, 3, 4, 5];
      const series = new Series(data);
      expect(series.length).toBe(5);
      expect(series[0]).toBe(1);
      expect(series[4]).toBe(5);
    });

    test('should create a Series with custom index', () => {
      const data = [10, 20, 30];
      const series = new Series(data, { index: ['a', 'b', 'c'] });
      expect(series.index).toEqual(['a', 'b', 'c']);
      expect(series.get('a')).toBe(10);
      expect(series.get('b')).toBe(20);
    });

    test('should create a Series with a name', () => {
      const series = new Series([1, 2, 3], { name: 'test_series' });
      expect(series.name).toBe('test_series');
    });

    test('should infer numeric type for numeric data', () => {
      const series = new Series([1, 2, 3, 4, 5]);
      expect(series.dtype).toBe('numeric');
    });

    test('should infer string type for string data', () => {
      const series = new Series(['a', 'b', 'c']);
      expect(series.dtype).toBe('string');
    });

    test('should infer mixed type for mixed data', () => {
      const series = new Series([1, 'a', true]);
      expect(series.dtype).toBe('mixed');
    });

    test('should throw error if data is not an array', () => {
      expect(() => new Series('not an array')).toThrow();
      expect(() => new Series(123)).toThrow();
      expect(() => new Series({ a: 1 })).toThrow();
    });

    test('should handle empty Series', () => {
      const series = new Series([]);
      expect(series.length).toBe(0);
      expect(series.dtype).toBe('null');
    });
  });

  describe('Index and Value Access', () => {
    test('should get value by index label', () => {
      const series = new Series([10, 20, 30], { index: ['x', 'y', 'z'] });
      expect(series.get('x')).toBe(10);
      expect(series.get('y')).toBe(20);
      expect(series.get('z')).toBe(30);
    });

    test('should set value by index label', () => {
      const series = new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
      series.set('b', 25);
      expect(series.get('b')).toBe(25);
    });

    test('should throw error when getting non-existent label', () => {
      const series = new Series([1, 2, 3], { index: ['a', 'b', 'c'] });
      expect(() => series.get('d')).toThrow(DataFrameError);
    });

    test('should throw error when setting non-existent label', () => {
      const series = new Series([1, 2, 3], { index: ['a', 'b', 'c'] });
      expect(() => series.set('d', 99)).toThrow(DataFrameError);
    });

    test('should support numeric index access', () => {
      const series = new Series([10, 20, 30]);
      expect(series[0]).toBe(10);
      expect(series[1]).toBe(20);
      expect(series[2]).toBe(30);
    });
  });

  describe('Iteration', () => {
    test('should support for...of iteration', () => {
      const series = new Series([1, 2, 3]);
      const values = [];
      for (const value of series) {
        values.push(value);
      }
      expect(values).toEqual([1, 2, 3]);
    });

    test('should support forEach iteration', () => {
      const series = new Series([1, 2, 3]);
      const values = [];
      series.forEach(value => values.push(value));
      expect(values).toEqual([1, 2, 3]);
    });

    test('should support map iteration', () => {
      const series = new Series([1, 2, 3]);
      const doubled = Array.from(series).map(x => x * 2);
      expect(doubled).toEqual([2, 4, 6]);
    });
  });

  describe('Transformation Methods', () => {
    test('should map values to new Series', () => {
      const series = new Series([1, 2, 3]);
      const doubled = series.map(x => x * 2);
      expect(doubled.length).toBe(3);
      expect(doubled[0]).toBe(2);
      expect(doubled[1]).toBe(4);
      expect(doubled[2]).toBe(6);
    });

    test('should preserve index in map operation', () => {
      const series = new Series([1, 2, 3], { index: ['a', 'b', 'c'] });
      const doubled = series.map(x => x * 2);
      expect(doubled.index).toEqual(['a', 'b', 'c']);
    });

    test('should preserve name in map operation', () => {
      const series = new Series([1, 2, 3], { name: 'original' });
      const doubled = series.map(x => x * 2);
      expect(doubled.name).toBe('original');
    });

    test('should apply function with index parameter', () => {
      const series = new Series([10, 20, 30]);
      const result = series.map((value, idx) => value + idx);
      expect(result[0]).toBe(10); // 10 + 0
      expect(result[1]).toBe(21); // 20 + 1
      expect(result[2]).toBe(32); // 30 + 2
    });

    test('should throw error if map function is not a function', () => {
      const series = new Series([1, 2, 3]);
      expect(() => series.map('not a function')).toThrow();
    });

    test('should throw error if map function throws', () => {
      const series = new Series([1, 2, 3]);
      expect(() => series.map(() => {
        throw new Error('test error');
      })).toThrow(OperationError);
    });

    test('should apply function with apply method', () => {
      const series = new Series([1, 2, 3]);
      const result = series.apply(x => x + 10);
      expect(result[0]).toBe(11);
      expect(result[1]).toBe(12);
      expect(result[2]).toBe(13);
    });

    test('should replace single value', () => {
      const series = new Series([1, 2, 3, 2, 1]);
      const replaced = series.replace(2, 99);
      expect(replaced[0]).toBe(1);
      expect(replaced[1]).toBe(99);
      expect(replaced[2]).toBe(3);
      expect(replaced[3]).toBe(99);
      expect(replaced[4]).toBe(1);
    });

    test('should replace with function condition', () => {
      const series = new Series([1, 2, 3, 4, 5]);
      const replaced = series.replace(x => x > 3, 0);
      expect(replaced[0]).toBe(1);
      expect(replaced[1]).toBe(2);
      expect(replaced[2]).toBe(3);
      expect(replaced[3]).toBe(0);
      expect(replaced[4]).toBe(0);
    });

    test('should preserve index in replace operation', () => {
      const series = new Series([1, 2, 3], { index: ['a', 'b', 'c'] });
      const replaced = series.replace(2, 99);
      expect(replaced.index).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Statistical Methods - Sum and Count', () => {
    test('should compute sum of numeric Series', () => {
      const series = new Series([1, 2, 3, 4, 5]);
      expect(series.sum()).toBe(15);
    });

    test('should exclude null values from sum', () => {
      const series = new Series([1, null, 3, undefined, 5]);
      expect(series.sum()).toBe(9);
    });

    test('should throw error for non-numeric Series sum', () => {
      const series = new Series(['a', 'b', 'c']);
      expect(() => series.sum()).toThrow(TypeErrorClass);
    });

    test('should count non-null values', () => {
      const series = new Series([1, 2, null, 4, undefined, 6]);
      expect(series.count()).toBe(4);
    });

    test('should count all values in Series without nulls', () => {
      const series = new Series([1, 2, 3, 4, 5]);
      expect(series.count()).toBe(5);
    });

    test('should return 0 count for empty Series', () => {
      const series = new Series([]);
      expect(series.count()).toBe(0);
    });
  });

  describe('Statistical Methods - Mean and Median', () => {
    test('should compute mean of numeric Series', () => {
      const series = new Series([1, 2, 3, 4, 5]);
      expect(series.mean()).toBe(3);
    });

    test('should exclude null values from mean', () => {
      const series = new Series([10, 20, null, 30]);
      expect(series.mean()).toBe(20);
    });

    test('should throw error for non-numeric Series mean', () => {
      const series = new Series(['a', 'b', 'c']);
      expect(() => series.mean()).toThrow(TypeErrorClass);
    });

    test('should compute median of odd-length numeric Series', () => {
      const series = new Series([1, 2, 3, 4, 5]);
      expect(series.median()).toBe(3);
    });

    test('should compute median of even-length numeric Series', () => {
      const series = new Series([1, 2, 3, 4]);
      expect(series.median()).toBe(2.5);
    });

    test('should exclude null values from median', () => {
      const series = new Series([1, null, 2, 3, null, 4, 5]);
      expect(series.median()).toBe(3);
    });

    test('should throw error for non-numeric Series median', () => {
      const series = new Series(['a', 'b', 'c']);
      expect(() => series.median()).toThrow(TypeErrorClass);
    });
  });

  describe('Statistical Methods - Mode', () => {
    test('should compute mode of numeric Series', () => {
      const series = new Series([1, 2, 2, 3, 3, 3]);
      expect(series.mode()).toBe(3);
    });

    test('should compute mode of string Series', () => {
      const series = new Series(['a', 'b', 'a', 'c', 'a']);
      expect(series.mode()).toBe('a');
    });

    test('should return first mode if multiple modes exist', () => {
      const series = new Series([1, 1, 2, 2, 3]);
      const mode = series.mode();
      expect([1, 2]).toContain(mode);
    });

    test('should exclude null values from mode', () => {
      const series = new Series([1, null, 1, 2, 2, 2]);
      expect(series.mode()).toBe(2);
    });

    test('should throw error for empty Series', () => {
      const series = new Series([]);
      expect(() => series.mode()).toThrow(DataFrameError);
    });

    test('should throw error for all-null Series', () => {
      const series = new Series([null, null, undefined]);
      expect(() => series.mode()).toThrow(DataFrameError);
    });
  });

  describe('Statistical Methods - Min and Max', () => {
    test('should compute min of numeric Series', () => {
      const series = new Series([5, 2, 8, 1, 9]);
      expect(series.min()).toBe(1);
    });

    test('should compute max of numeric Series', () => {
      const series = new Series([5, 2, 8, 1, 9]);
      expect(series.max()).toBe(9);
    });

    test('should compute min of string Series', () => {
      const series = new Series(['zebra', 'apple', 'mango']);
      expect(series.min()).toBe('apple');
    });

    test('should compute max of string Series', () => {
      const series = new Series(['zebra', 'apple', 'mango']);
      expect(series.max()).toBe('zebra');
    });

    test('should exclude null values from min', () => {
      const series = new Series([5, null, 2, undefined, 8]);
      expect(series.min()).toBe(2);
    });

    test('should exclude null values from max', () => {
      const series = new Series([5, null, 2, undefined, 8]);
      expect(series.max()).toBe(8);
    });

    test('should throw error for empty Series min', () => {
      const series = new Series([]);
      expect(() => series.min()).toThrow(DataFrameError);
    });

    test('should throw error for all-null Series min', () => {
      const series = new Series([null, undefined]);
      expect(() => series.min()).toThrow(DataFrameError);
    });

    test('should throw error for empty Series max', () => {
      const series = new Series([]);
      expect(() => series.max()).toThrow(DataFrameError);
    });

    test('should throw error for all-null Series max', () => {
      const series = new Series([null, undefined]);
      expect(() => series.max()).toThrow(DataFrameError);
    });
  });

  describe('Statistical Methods - Std and Var', () => {
    test('should compute standard deviation', () => {
      const series = new Series([1, 2, 3, 4, 5]);
      const std = series.std();
      expect(std).toBeCloseTo(1.5811, 4);
    });

    test('should compute variance', () => {
      const series = new Series([1, 2, 3, 4, 5]);
      const variance = series.var();
      expect(variance).toBeCloseTo(2.5, 4);
    });

    test('should exclude null values from std', () => {
      const series = new Series([1, null, 2, 3, null, 4, 5]);
      const std = series.std();
      expect(std).toBeCloseTo(1.5811, 4);
    });

    test('should exclude null values from var', () => {
      const series = new Series([1, null, 2, 3, null, 4, 5]);
      const variance = series.var();
      expect(variance).toBeCloseTo(2.5, 4);
    });

    test('should throw error for std with fewer than 2 numeric values', () => {
      const series = new Series([1]);
      expect(() => series.std()).toThrow(TypeErrorClass);
    });

    test('should throw error for var with fewer than 2 numeric values', () => {
      const series = new Series([1]);
      expect(() => series.var()).toThrow(TypeErrorClass);
    });

    test('should throw error for std of non-numeric Series', () => {
      const series = new Series(['a', 'b', 'c']);
      expect(() => series.std()).toThrow(TypeErrorClass);
    });

    test('should throw error for var of non-numeric Series', () => {
      const series = new Series(['a', 'b', 'c']);
      expect(() => series.var()).toThrow(TypeErrorClass);
    });
  });

  describe('Edge Cases', () => {
    test('should handle Series with mixed numeric and string values', () => {
      const series = new Series([1, 'a', 2, 'b', 3]);
      expect(series.dtype).toBe('mixed');
      expect(series.count()).toBe(5);
    });

    test('should handle Series with numeric strings', () => {
      const series = new Series(['1', '2', '3']);
      // Numeric strings are detected as numeric type
      expect(series.dtype).toBe('numeric');
    });

    test('should handle Series with boolean values', () => {
      const series = new Series([true, false, true]);
      expect(series.dtype).toBe('boolean');
    });

    test('should handle Series with all null values', () => {
      const series = new Series([null, null, undefined]);
      expect(series.count()).toBe(0);
      expect(series.dtype).toBe('null');
    });

    test('should handle transformation that returns null', () => {
      const series = new Series([1, 2, 3]);
      const result = series.map(() => null);
      expect(result[0]).toBeNull();
      expect(result[1]).toBeNull();
      expect(result[2]).toBeNull();
    });

    test('should handle large Series', () => {
      const data = Array.from({ length: 10000 }, (_, i) => i);
      const series = new Series(data);
      expect(series.length).toBe(10000);
      expect(series.sum()).toBe((10000 * 9999) / 2);
    });
  });

  describe('Show Property', () => {
    test('should have show property that displays data', () => {
      const series = new Series([1, 2, 3]);
      expect(() => series.show).not.toThrow();
    });
  });
});
