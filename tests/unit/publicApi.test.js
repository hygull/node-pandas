/**
 * Unit tests for the public entry point (src/index.js).
 * Guards the factory-style API documented in README: pd.Series(...) and
 * pd.DataFrame(...) must work with or without `new`.
 */

const pd = require('../../src/index');
const SeriesClass = require('../../src/series/series');

describe('Public API (src/index.js)', () => {
  describe('pd.Series', () => {
    test('can be called without new (v1-compatible factory form)', () => {
      const s = pd.Series([1, 2, 3]);
      expect(s).toBeInstanceOf(SeriesClass);
      expect(Array.from(s)).toEqual([1, 2, 3]);
    });

    test('can still be called with new', () => {
      const s = new pd.Series([1, 2, 3]);
      expect(s).toBeInstanceOf(SeriesClass);
      expect(s.length).toBe(3);
    });

    test('passes options through when called without new', () => {
      const s = pd.Series([10, 20], { index: ['a', 'b'], name: 'vals' });
      expect(s.index).toEqual(['a', 'b']);
      expect(s.name).toBe('vals');
      expect(s.loc.get('b')).toBe(20);
    });

    test('instances from either form pass instanceof pd.Series', () => {
      expect(pd.Series([1])).toBeInstanceOf(pd.Series);
      expect(new pd.Series([1])).toBeInstanceOf(pd.Series);
    });
  });

  describe('pd.readCsv', () => {
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    let dir;

    beforeEach(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'np-readcsv-'));
    });

    afterEach(() => {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    test('reads a CSV into a DataFrame with header columns and numeric conversion', () => {
      const file = path.join(dir, 'people.csv');
      fs.writeFileSync(file, 'name,team,salary\nRishikesh Agrawani,Eng,90000\n\n\nSandhya Agrawani,Sales,70000\n');

      const df = pd.readCsv(file);

      expect(df.columns).toEqual(['name', 'team', 'salary']);
      expect(df.rows).toBe(2);
      expect(df.getRow(0)).toEqual({ name: 'Rishikesh Agrawani', team: 'Eng', salary: 90000 });
      expect(df.getCell(1, 'salary')).toBe(70000);
    });
  });
});
