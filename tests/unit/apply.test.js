const DataFrame = require('../../src/dataframe/dataframe');
const Series = require('../../src/series/series');
const { ValidationError, OperationError } = require('../../src/utils/errors');

describe('DataFrame.apply()', () => {
  const buildDf = () => DataFrame([[1,10,100],[2,20,200],[3,30,300]], ['a','b','c']);

  describe('axis 0 (column-wise, default)', () => {
    test('passes a Series per column to fn', () => {
      const df = buildDf();
      const seenNames = [];
      df.apply(col => { expect(col).toBeInstanceOf(Series); seenNames.push(col._name); return col.length; });
      expect(seenNames).toEqual(['a','b','c']);
    });
    test('returns Series of scalar results indexed by column name', () => {
      const out = buildDf().apply(col => col._data.reduce((a,b)=>a+b,0));
      expect(out).toBeInstanceOf(Series);
      expect(out._index).toEqual(['a','b','c']);
      expect(out._data).toEqual([6,60,600]);
    });
    test('default axis is 0', () => {
      const out = buildDf().apply(col => col._name);
      expect(out._data).toEqual(['a','b','c']);
    });
  });

  describe('axis 1 (row-wise)', () => {
    test('passes a Series per row to fn', () => {
      const out = buildDf().apply(row => row._data.reduce((a,b)=>a+b,0), { axis: 1 });
      expect(out).toBeInstanceOf(Series);
      expect(out._data).toEqual([111,222,333]);
    });
    test('row Series index is the column names', () => {
      buildDf().apply(row => { expect(row._index).toEqual(['a','b','c']); return 0; }, { axis: 1 });
    });
  });

  describe('return shape', () => {
    test('fn returning array yields a DataFrame', () => {
      const out = buildDf().apply(col => [col._data[0], col._data[col._data.length - 1]]);
      expect(out.rows).toBe(2);
    });
    test('mixed scalar and array returns throws OperationError', () => {
      let i = 0;
      expect(() => buildDf().apply(() => (i++ === 0 ? 1 : [1,2]))).toThrow(OperationError);
    });
    test('axis 0 with array returns preserves df columns as result columns', () => {
      const df = buildDf();  // columns ['a','b','c']
      const out = df.apply(col => [col._data[0], col._data[col._data.length - 1]]);
      expect(out.columns).toEqual(['a', 'b', 'c']);
      expect(out.rows).toBe(2);
      expect(out.getRow(0)).toEqual({ a: 1, b: 10, c: 100 });
      expect(out.getRow(1)).toEqual({ a: 3, b: 30, c: 300 });
    });

    test('axis 1 with array returns preserves df row labels as result index', () => {
      const df = buildDf();
      df.index = ['x', 'y', 'z'];
      const out = df.apply(row => [row._data[0] * 2, row._data[1] * 2], { axis: 1 });
      expect(out.rows).toBe(3);
      expect(out.index).toEqual(['x', 'y', 'z']);
      expect(out.getRow(0)).toEqual({ '0': 2, '1': 20 });
    });

    test('throws OperationError when array returns have non-uniform lengths', () => {
      const df = buildDf();
      let i = 0;
      expect(() => df.apply(() => (i++ === 0 ? [1, 2] : [1, 2, 3]))).toThrow(OperationError);
    });
  });

  describe('errors', () => {
    test('throws ValidationError if fn is not a function', () => {
      expect(() => buildDf().apply(null)).toThrow(ValidationError);
      expect(() => buildDf().apply(42)).toThrow(ValidationError);
    });
    test('throws ValidationError if axis is not 0 or 1', () => {
      expect(() => buildDf().apply(x=>x, { axis: 2 })).toThrow(ValidationError);
      expect(() => buildDf().apply(x=>x, { axis: 'row' })).toThrow(ValidationError);
    });
    test('errors thrown by fn propagate', () => {
      expect(() => buildDf().apply(() => { throw new Error('boom'); })).toThrow('boom');
    });
  });

  describe('immutability', () => {
    test('does not mutate the original DataFrame', () => {
      const df = buildDf();
      const before = JSON.stringify(df.data);
      df.apply(col => col._data[0]);
      expect(JSON.stringify(df.data)).toBe(before);
    });
  });
});
