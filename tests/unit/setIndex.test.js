/**
 * Unit tests for DataFrame.setIndex() method.
 * Validates: indexing-foundation spec Component 1.
 */

const DataFrame = require('../../src/dataframe/dataframe');

describe('DataFrame.setIndex()', () => {
  const buildDf = () => DataFrame(
    [[1, 'Alice', 25], [2, 'Bob', 30], [3, 'Carol', 35]],
    ['id', 'name', 'age']
  );

  describe('happy path', () => {
    test('promotes named column to index with drop:true (default)', () => {
      const df = buildDf();
      const out = df.setIndex('id');
      expect(out.index).toEqual([1, 2, 3]);
      expect(out.columns).toEqual(['name', 'age']);
      expect(out.data[0]).toEqual(['Alice', 25]);
      expect(out.data[2]).toEqual(['Carol', 35]);
    });

    test('keeps the column when drop:false', () => {
      const df = buildDf();
      const out = df.setIndex('id', { drop: false });
      expect(out.index).toEqual([1, 2, 3]);
      expect(out.columns).toEqual(['id', 'name', 'age']);
      expect(out.data[0]).toEqual([1, 'Alice', 25]);
    });

    test('returns a new DataFrame; original is unchanged (immutability)', () => {
      const df = buildDf();
      const originalIndex = [...df.index];
      const originalColumns = [...df.columns];
      df.setIndex('id');
      expect(df.index).toEqual(originalIndex);
      expect(df.columns).toEqual(originalColumns);
    });
  });

  describe('edge cases', () => {
    test('empty DataFrame returns empty DataFrame', () => {
      const df = DataFrame([], []);
      const out = df.setIndex('any');
      expect(out.rows).toBe(0);
    });

    test('allows duplicate values in the new index', () => {
      const df = DataFrame([[1, 'a'], [1, 'b'], [2, 'c']], ['k', 'v']);
      const out = df.setIndex('k');
      expect(out.index).toEqual([1, 1, 2]);
    });

    test('handles single-row DataFrame', () => {
      const df = DataFrame([[1, 'Alice']], ['id', 'name']);
      const out = df.setIndex('id');
      expect(out.index).toEqual([1]);
      expect(out.columns).toEqual(['name']);
    });
  });

  describe('errors', () => {
    test('throws ColumnError when column does not exist', () => {
      const df = buildDf();
      expect(() => df.setIndex('missing')).toThrow(/missing/);
    });

    test('throws ValidationError when columnName is not a string', () => {
      const df = buildDf();
      expect(() => df.setIndex(42)).toThrow();
      expect(() => df.setIndex(null)).toThrow();
      expect(() => df.setIndex(undefined)).toThrow();
    });
  });
});
