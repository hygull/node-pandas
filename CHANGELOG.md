# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

