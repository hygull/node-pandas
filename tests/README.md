# Testing Infrastructure

This directory contains the comprehensive testing infrastructure for node-pandas, organized into three categories: unit tests, integration tests, and property-based tests.

## Directory Structure

```
tests/
├── unit/              # Unit tests for individual functions and methods
├── integration/       # Integration tests for workflows combining components
├── property/          # Property-based tests for universal correctness properties
├── utils/             # Test utilities and helpers
├── setup.js           # Test environment setup
└── README.md          # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test suites
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:property      # Property-based tests only
```

## Test Utilities

### Test Data Generator (`tests/utils/testDataGenerator.js`)

Provides functions to generate sample data for tests:

- `generateNumericArray(length, start)` - Generate numeric arrays
- `generateMixedArray(length)` - Generate arrays with mixed types
- `generate2DArray(rows, cols)` - Generate 2D arrays for DataFrames
- `generateDataFrameData(rows)` - Generate sample DataFrame data
- `generateCategoricalData(rows)` - Generate data with categories for grouping
- `generateDataWithNulls(rows)` - Generate data with null values
- `generateMergeData()` - Generate datasets for merge operations

### Test Assertions (`tests/utils/testAssertions.js`)

Provides custom assertion utilities:

- `assertArrayEqual(actual, expected, message)` - Assert array equality
- `assertNumeric(value, message)` - Assert value is numeric
- `assertString(value, message)` - Assert value is string
- `assertNullish(value, message)` - Assert value is null or undefined
- `assertApproximatelyEqual(actual, expected, tolerance, message)` - Assert numeric approximation
- `assertInstanceOf(value, constructor, message)` - Assert instance type
- `assertHasProperties(obj, properties, message)` - Assert object properties
- `assert2DArrayDimensions(array, rows, cols, message)` - Assert 2D array dimensions

## Writing Tests

### Unit Tests

Unit tests verify individual functions and methods in isolation. Place them in `tests/unit/`:

```javascript
describe('Series', () => {
  test('creates a Series with array data', () => {
    const { Series } = require('../../src/series/series');
    const s = new Series([1, 2, 3]);
    expect(s.length).toBe(3);
  });
});
```

### Integration Tests

Integration tests verify workflows combining multiple components. Place them in `tests/integration/`:

```javascript
describe('DataFrame Workflow', () => {
  test('loads CSV and filters data', () => {
    // Test complete workflow
  });
});
```

### Property-Based Tests

Property-based tests verify universal correctness properties. Place them in `tests/property/`:

```javascript
describe('Property: Series Creation Preserves Array Elements', () => {
  test('validates property for various inputs', () => {
    // Test property across many inputs
  });
});
```

## Coverage Goals

The project aims for at least 80% code coverage across:
- Statements
- Branches
- Functions
- Lines

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## Test Framework

The project uses **Jest** as the testing framework:
- Modern, zero-config testing framework
- Built-in assertion library
- Code coverage reporting with Istanbul/nyc
- Watch mode for development
- Snapshot testing support

## Configuration

Jest configuration is in `jest.config.js`:
- Test environment: Node.js
- Test files: `**/tests/**/*.test.js`
- Coverage threshold: 80% for all metrics
- Setup file: `tests/setup.js`

## Best Practices

1. **Descriptive test names** - Use clear, specific test descriptions
2. **Arrange-Act-Assert** - Structure tests with setup, execution, and verification
3. **Test edge cases** - Include tests for boundary conditions and error cases
4. **Use test utilities** - Leverage data generators and assertions
5. **Keep tests focused** - Each test should verify one behavior
6. **Avoid test interdependence** - Tests should be independent and runnable in any order
7. **Mock external dependencies** - Use Jest mocks for external services
8. **Document complex tests** - Add comments explaining non-obvious test logic

## Continuous Integration

Tests are designed to run in CI/CD pipelines:
- All tests must pass before merging
- Coverage reports are generated for each build
- Tests run in Node.js environment without GUI dependencies
