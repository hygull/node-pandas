/**
 * Example test to verify Jest setup is working
 */

describe('Testing Infrastructure Setup', () => {
  test('Jest is configured correctly', () => {
    expect(true).toBe(true);
  });

  test('Test utilities can be imported', () => {
    const { generateNumericArray } = require('../utils/testDataGenerator');
    const arr = generateNumericArray(5);
    expect(arr).toHaveLength(5);
    expect(arr[0]).toBe(1);
  });

  test('Assertion utilities can be imported', () => {
    const { assertArrayEqual } = require('../utils/testAssertions');
    expect(() => {
      assertArrayEqual([1, 2, 3], [1, 2, 3]);
    }).not.toThrow();
  });
});
