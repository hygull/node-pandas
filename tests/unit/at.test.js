const Series = require('../../src/series/series');
const DataFrame = require('../../src/dataframe/dataframe');
const { IndexError, ValidationError, ColumnError } = require('../../src/utils/errors');

describe('Series.at indexer', () => {
  const build = () => new Series([10, 20, 30], { index: ['a', 'b', 'c'] });

  describe('get', () => {
    test('returns scalar value at the given label', () => {
      const s = build();
      expect(s.at.get('a')).toBe(10);
      expect(s.at.get('b')).toBe(20);
      expect(s.at.get('c')).toBe(30);
    });

    test('throws IndexError when label is not found', () => {
      const s = build();
      expect(() => s.at.get('z')).toThrow(IndexError);
    });

    test('IndexError context includes operation, value, and expected fields', () => {
      const s = build();
      try {
        s.at.get('z');
        throw new Error('should have thrown');
      } catch (e) {
        expect(e.context).toBeDefined();
        expect(e.context.operation).toBe('Series.at.get');
        expect(e.context.value).toBe('z');
        expect(e.context.expected).toBeDefined();
      }
    });

    test('throws ValidationError when label is an array', () => {
      const s = build();
      expect(() => s.at.get(['a', 'b'])).toThrow(ValidationError);
    });
  });

  describe('set', () => {
    test('mutates the value at the given label in place', () => {
      const s = build();
      s.at.set('b', 99);
      expect(s.at.get('b')).toBe(99);
      expect(s._data[1]).toBe(99);
    });

    test('returns the Series for chaining', () => {
      const s = build();
      const out = s.at.set('a', 0);
      expect(out).toBe(s);
    });

    test('throws IndexError when label is not found', () => {
      const s = build();
      expect(() => s.at.set('z', 1)).toThrow(IndexError);
    });

    test('throws ValidationError when label is an array', () => {
      const s = build();
      expect(() => s.at.set(['a'], 1)).toThrow(ValidationError);
    });
  });

  describe('duplicate labels', () => {
    test('get returns the first match when label is duplicated in the index', () => {
      // Current behavior: _index.indexOf returns the first match. Pin this so
      // a future pandas-style "raise on ambiguous label" change is deliberate.
      const s = new Series([10, 20, 30], { index: ['a', 'b', 'a'] });
      expect(s.at.get('a')).toBe(10);
    });

    test('set mutates only the first occurrence of a duplicated label', () => {
      const s = new Series([10, 20, 30], { index: ['a', 'b', 'a'] });
      s.at.set('a', 99);
      expect(s._data[0]).toBe(99);
      expect(s._data[2]).toBe(30);
    });
  });
});

describe('DataFrame.at indexer', () => {
  const build = () => {
    const df = DataFrame([[1, 'Alice', 25], [2, 'Bob', 30]], ['id', 'name', 'age']);
    df.index = ['x', 'y'];
    return df;
  };

  describe('get', () => {
    test('returns scalar at (rowLabel, colName)', () => {
      const df = build();
      expect(df.at.get('x', 'name')).toBe('Alice');
      expect(df.at.get('y', 'age')).toBe(30);
    });
    test('throws IndexError on missing rowLabel', () => {
      expect(() => build().at.get('z', 'name')).toThrow(IndexError);
    });
    test('throws ColumnError on missing colName', () => {
      expect(() => build().at.get('x', 'missing')).toThrow(ColumnError);
    });
    test('throws ValidationError when arguments are non-scalar', () => {
      expect(() => build().at.get(['x'], 'name')).toThrow(ValidationError);
      expect(() => build().at.get('x', ['name'])).toThrow(ValidationError);
    });
  });

  describe('set', () => {
    test('mutates the cell in place', () => {
      const df = build();
      df.at.set('x', 'name', 'Alicia');
      expect(df.at.get('x', 'name')).toBe('Alicia');
    });
    test('returns the DataFrame for chaining', () => {
      const df = build();
      expect(df.at.set('x', 'name', 'A')).toBe(df);
    });
    test('throws on missing row, missing col, or non-scalar args', () => {
      const df = build();
      expect(() => df.at.set('z', 'name', 1)).toThrow(IndexError);
      expect(() => df.at.set('x', 'missing', 1)).toThrow(ColumnError);
      expect(() => df.at.set(['x'], 'name', 1)).toThrow(ValidationError);
    });
  });
});
