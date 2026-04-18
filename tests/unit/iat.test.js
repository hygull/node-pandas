const Series = require('../../src/series/series');
const DataFrame = require('../../src/dataframe/dataframe');
const { IndexError, ValidationError } = require('../../src/utils/errors');

describe('Series.iat indexer', () => {
  const build = () => new Series([10, 20, 30], { index: ['a', 'b', 'c'] });
  test('get returns scalar at integer position', () => {
    const s = build();
    expect(s.iat.get(0)).toBe(10);
    expect(s.iat.get(2)).toBe(30);
  });
  test('set mutates cell in place and returns Series', () => {
    const s = build();
    expect(s.iat.set(1, 99)).toBe(s);
    expect(s.iat.get(1)).toBe(99);
    expect(s._data[1]).toBe(99);
    expect(s[1]).toBe(99);
  });
  test('throws IndexError when position is out of range', () => {
    const s = build();
    expect(() => s.iat.get(5)).toThrow(IndexError);
    expect(() => s.iat.set(-1, 0)).toThrow(IndexError);
  });
  test('throws ValidationError when position is non-integer or array', () => {
    const s = build();
    expect(() => s.iat.get([0])).toThrow(ValidationError);
    expect(() => s.iat.get(1.5)).toThrow(ValidationError);
    expect(() => s.iat.set('0', 1)).toThrow(ValidationError);
  });
});

describe('DataFrame.iat indexer', () => {
  const build = () => DataFrame([[1, 'Alice', 25], [2, 'Bob', 30]], ['id', 'name', 'age']);
  test('get returns scalar at (rowPos, colPos)', () => {
    const df = build();
    expect(df.iat.get(0, 1)).toBe('Alice');
    expect(df.iat.get(1, 2)).toBe(30);
  });
  test('set mutates cell and returns DataFrame', () => {
    const df = build();
    expect(df.iat.set(0, 1, 'Alicia')).toBe(df);
    expect(df.iat.get(0, 1)).toBe('Alicia');
  });
  test('throws IndexError on out-of-range row or col position', () => {
    const df = build();
    expect(() => df.iat.get(5, 0)).toThrow(IndexError);
    expect(() => df.iat.get(0, 9)).toThrow(IndexError);
  });
  test('throws ValidationError on non-integer or array args', () => {
    const df = build();
    expect(() => df.iat.get([0], 0)).toThrow(ValidationError);
    expect(() => df.iat.get(0, '1')).toThrow(ValidationError);
    expect(() => df.iat.get(0.5, 0)).toThrow(ValidationError);
  });
});
