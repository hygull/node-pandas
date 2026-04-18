const DataFrame = require('../../src/dataframe/dataframe');
const { ColumnError, ValidationError } = require('../../src/utils/errors');

describe('DataFrame.resetIndex()', () => {
  const buildIndexedDf = () => {
    const df = DataFrame([[10, 'Alice'], [20, 'Bob']], ['age', 'name']);
    df.index = ['a', 'b'];
    return df;
  };

  describe('happy path', () => {
    test('default (drop:false) promotes index to a column named "index"', () => {
      const df = buildIndexedDf();
      const out = df.resetIndex();
      expect(out.columns).toEqual(['index', 'age', 'name']);
      expect(out.index).toEqual([0, 1]);
      expect(out.getRow(0)).toEqual({ index: 'a', age: 10, name: 'Alice' });
      expect(out.getRow(1)).toEqual({ index: 'b', age: 20, name: 'Bob' });
    });

    test('custom name is used when provided', () => {
      const df = buildIndexedDf();
      const out = df.resetIndex({ name: 'label' });
      expect(out.columns).toEqual(['label', 'age', 'name']);
    });

    test('drop:true discards the index without promoting', () => {
      const df = buildIndexedDf();
      const out = df.resetIndex({ drop: true });
      expect(out.columns).toEqual(['age', 'name']);
      expect(out.index).toEqual([0, 1]);
      expect(out.getRow(0)).toEqual({ age: 10, name: 'Alice' });
    });

    test('returns a new DataFrame; original is unchanged (immutability)', () => {
      const df = buildIndexedDf();
      const originalIndex = [...df.index];
      df.resetIndex();
      expect(df.index).toEqual(originalIndex);
    });
  });

  describe('edge cases', () => {
    test('empty DataFrame returns empty DataFrame', () => {
      const df = DataFrame([], []);
      const out = df.resetIndex();
      expect(out.rows).toBe(0);
    });

    test('drop:false with shorter index produces undefined in promoted column for unmatched rows', () => {
      // Current behavior: index setter does not validate length; resetIndex will pick
      // up `undefined` for rows beyond the index length. Pin this so a future change
      // has to deliberately decide whether to validate.
      const df = DataFrame([[1, 'a'], [2, 'b']], ['x', 'y']);
      df.index = ['only-one'];  // length 1 vs. 2 rows
      const out = df.resetIndex();
      expect(out.getRow(0)).toEqual({ index: 'only-one', x: 1, y: 'a' });
      expect(out.getRow(1)).toEqual({ index: undefined, x: 2, y: 'b' });
    });

    test('drop:true silently ignores the name option', () => {
      const df = DataFrame([[10, 'Alice']], ['age', 'name']);
      df.index = ['x'];
      const out = df.resetIndex({ drop: true, name: 'should-be-ignored' });
      expect(out.columns).toEqual(['age', 'name']);  // name not added
    });
  });

  describe('errors', () => {
    test('throws ColumnError when name collides with existing column (drop:false)', () => {
      const df = buildIndexedDf();
      expect(() => df.resetIndex({ name: 'age' })).toThrow(ColumnError);
    });

    test('throws ValidationError when name is not a string', () => {
      const df = buildIndexedDf();
      expect(() => df.resetIndex({ name: 42 })).toThrow(ValidationError);
    });

    test('throws ColumnError on empty DataFrame when name collides (drop:false)', () => {
      const df = DataFrame([], ['age']);
      expect(() => df.resetIndex({ name: 'age' })).toThrow(ColumnError);
    });
  });
});
