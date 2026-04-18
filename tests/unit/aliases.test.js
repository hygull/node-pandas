const Series = require('../../src/series/series');

describe('camelCase ↔ snake_case aliases', () => {
  describe('Series', () => {
    test('sortValues is the same function as sort_values', () => {
      expect(Series.prototype.sortValues).toBe(Series.prototype.sort_values);
    });
    test('sortIndex is the same function as sort_index', () => {
      expect(Series.prototype.sortIndex).toBe(Series.prototype.sort_index);
    });
    test('valueCounts is the same function as value_counts', () => {
      expect(Series.prototype.valueCounts).toBe(Series.prototype.value_counts);
    });
    test('dropDuplicates is the same function as drop_duplicates', () => {
      expect(Series.prototype.dropDuplicates).toBe(Series.prototype.drop_duplicates);
    });
    test('sortValues called via camelCase produces identical result to snake_case', () => {
      const s1 = new Series([3, 1, 2]);
      const s2 = new Series([3, 1, 2]);
      expect([...s1.sortValues()._data]).toEqual([...s2.sort_values()._data]);
    });
  });
});
