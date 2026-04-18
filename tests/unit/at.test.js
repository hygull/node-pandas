const Series = require('../../src/series/series');
const { IndexError, ValidationError } = require('../../src/utils/errors');

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
});
