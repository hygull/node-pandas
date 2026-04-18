# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2026-04-18

### Added
- DataFrame.setIndex(columnName, { drop }) — promote a column to be the index
- DataFrame.resetIndex({ drop, name }) — demote the current index back to a column or discard it
- Series.at / DataFrame.at — fast scalar label-based cell accessors with .get / .set
- Series.iat / DataFrame.iat — fast scalar position-based cell accessors with .get / .set
- DataFrame.apply(fn, { axis }) — apply a function column-wise (axis 0) or row-wise (axis 1), passing real Series instances to the callback
- camelCase aliases for the existing snake_case methods (sortValues, sortIndex, valueCounts, dropDuplicates)

### Changed
- Established camelCase as the canonical naming convention; snake_case names retained as aliases. Documented in README under "Naming convention".

### Notes
- Zero breaking changes. All existing snake_case method calls continue to work via the new aliases.

## [2.2.0] - 2026-03-05

### Added
- Series sorting methods: sort_values() and sort_index() with ascending/descending support
- Series missing data handling: fillna(), dropna(), isna(), notna()
- Series value operations: unique(), value_counts(), duplicated(), drop_duplicates()
- Series comparison operations: eq(), ne(), gt(), lt(), ge(), le(), between()
- Series cumulative operations: cumsum(), cumprod(), cummax(), cummin()
- Series string accessor (str) with 9 methods: upper(), lower(), contains(), replace(), split(), strip(), startswith(), endswith(), len()
- Series indexing accessors: loc (label-based) and iloc (position-based) with get() and set() methods
- Series window operations: rolling(window) and expanding() with mean(), sum(), min(), max(), std()
- Comprehensive documentation for all new Series methods in README

### Changed
- Enhanced Series class with 40+ new methods for data manipulation
- Improved null value handling across all new methods
- Updated README with extensive examples for all new features

## [2.1.0] - 2026-02-28

### Added
- DataFrame.merge() method supporting inner, left, right, and outer joins with single/multiple join keys
- DataFrame.concat() static method for vertical (axis=0) and horizontal (axis=1) concatenation
- Comprehensive merge and concat examples in README (Examples 8 and 9)
- 35 new unit tests for merge and concat operations

## [2.0.0] - 2024-02-25

### Added
- Comprehensive DataFrame class with full JSDoc documentation and best practices
- Comprehensive Series class with statistical methods (mean, median, mode, std, var, min, max)
- DataFrame.select() method for column selection with validation
- DataFrame.filter() method with support for complex conditions and chaining
- DataFrame.groupBy() method with aggregation support (mean, sum, count, min, max, std)
- GroupBy aggregation for single and multiple columns with hierarchical grouping
- Full testing infrastructure with Jest configuration
- Type detection and validation utilities
- Comprehensive error handling system with custom error types
- CSV export functionality via toCsv() method
- Series transformation methods (map, apply, replace)
- Series statistical methods with null value handling
- 223 comprehensive unit tests covering all functionality

### Changed
- Major refactoring of core Series and DataFrame classes
- Enhanced error handling with custom ValidationError, ColumnError, and IndexError
- Improved type detection system for better data type inference
- Updated Jest configuration to exclude unimplemented modules from coverage

### Breaking Changes
- Complete API redesign for Series and DataFrame classes
- Changed method signatures for better consistency with pandas-like behavior
- Removed legacy implementation in favor of comprehensive refactored version
- All existing code using previous versions will require updates

### Fixed
- Fixed toCsv() bug with proper CSV formatting and special character handling
- Improved error messages for better debugging
- Fixed null and undefined value handling in statistical methods
- Fixed DataFrame row and column access edge cases

