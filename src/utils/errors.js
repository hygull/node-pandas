/**
 * @fileoverview Centralized error handling utilities for the node-pandas library.
 * Provides custom error classes with context information and suggestion generation
 * for common errors.
 * 
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5
 */

/**
 * Base error class for all DataFrame-related errors.
 * Extends the standard JavaScript Error class with context and suggestions.
 * 
 * @class DataFrameError
 * @extends Error
 * @param {string} message - The error message
 * @param {Object} context - Additional context information about the error
 * @param {string} context.operation - The operation being performed when error occurred
 * @param {*} context.value - The problematic value that caused the error
 * @param {string} context.column - The column name involved in the error (if applicable)
 * @param {string} context.expected - The expected value or type
 * @param {string} context.actual - The actual value or type received
 * @example
 * throw new DataFrameError('Invalid column', { 
 *   operation: 'select', 
 *   column: 'age',
 *   expected: 'existing column',
 *   actual: 'non-existent column'
 * });
 */
class DataFrameError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'DataFrameError';
    this.context = context;
    this.suggestions = generateSuggestions(this.name, context);
  }

  /**
   * Returns a formatted error message with context and suggestions
   * @returns {string} Formatted error message
   */
  toString() {
    let output = `${this.name}: ${this.message}`;
    
    if (Object.keys(this.context).length > 0) {
      output += '\n\nContext:';
      if (this.context.operation) {
        output += `\n  Operation: ${this.context.operation}`;
      }
      if (this.context.column) {
        output += `\n  Column: ${this.context.column}`;
      }
      if (this.context.expected) {
        output += `\n  Expected: ${this.context.expected}`;
      }
      if (this.context.actual) {
        output += `\n  Actual: ${this.context.actual}`;
      }
    }
    
    if (this.suggestions.length > 0) {
      output += '\n\nSuggestions:';
      this.suggestions.forEach((suggestion, index) => {
        output += `\n  ${index + 1}. ${suggestion}`;
      });
    }
    
    return output;
  }
}

/**
 * Error class for validation failures.
 * Used when data validation fails or invalid parameters are provided.
 * 
 * @class ValidationError
 * @extends DataFrameError
 * @param {string} message - The error message
 * @param {Object} context - Additional context information
 * @example
 * throw new ValidationError('Invalid column names', {
 *   operation: 'DataFrame creation',
 *   expected: 'array of strings',
 *   actual: 'array with non-string elements'
 * });
 */
class ValidationError extends DataFrameError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'ValidationError';
  }
}

/**
 * Error class for type-related errors.
 * Used when operations encounter type mismatches or incompatibilities.
 * 
 * @class TypeError
 * @extends DataFrameError
 * @param {string} message - The error message
 * @param {Object} context - Additional context information
 * @example
 * throw new TypeError('Cannot perform numeric operation on string column', {
 *   operation: 'mean',
 *   column: 'name',
 *   expected: 'numeric type',
 *   actual: 'string type'
 * });
 */
class TypeError extends DataFrameError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'TypeError';
  }
}

/**
 * Error class for index-related errors.
 * Used when accessing invalid indices or row/column positions.
 * 
 * @class IndexError
 * @extends DataFrameError
 * @param {string} message - The error message
 * @param {Object} context - Additional context information
 * @example
 * throw new IndexError('Row index out of bounds', {
 *   operation: 'row access',
 *   value: 100,
 *   expected: 'index between 0 and 50'
 * });
 */
class IndexError extends DataFrameError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'IndexError';
  }
}

/**
 * Error class for column-related errors.
 * Used when accessing non-existent columns or invalid column operations.
 * 
 * @class ColumnError
 * @extends DataFrameError
 * @param {string} message - The error message
 * @param {Object} context - Additional context information
 * @example
 * throw new ColumnError('Column not found', {
 *   operation: 'select',
 *   column: 'nonexistent',
 *   value: ['col1', 'col2']
 * });
 */
class ColumnError extends DataFrameError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'ColumnError';
  }
}

/**
 * Error class for I/O operations.
 * Used when file reading/writing fails or data format is invalid.
 * 
 * @class IOError
 * @extends DataFrameError
 * @param {string} message - The error message
 * @param {Object} context - Additional context information
 * @example
 * throw new IOError('File not found', {
 *   operation: 'readCsv',
 *   value: '/path/to/file.csv'
 * });
 */
class IOError extends DataFrameError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'IOError';
  }
}

/**
 * Error class for operation-related errors.
 * Used when operations fail due to invalid state or parameters.
 * 
 * @class OperationError
 * @extends DataFrameError
 * @param {string} message - The error message
 * @param {Object} context - Additional context information
 * @example
 * throw new OperationError('Cannot merge DataFrames without common key', {
 *   operation: 'merge',
 *   expected: 'common column name'
 * });
 */
class OperationError extends DataFrameError {
  constructor(message, context = {}) {
    super(message, context);
    this.name = 'OperationError';
  }
}

/**
 * Generates helpful suggestions based on error type and context.
 * Provides actionable recommendations to help users fix common errors.
 * 
 * @param {string} errorType - The type of error (e.g., 'ColumnError', 'ValidationError')
 * @param {Object} context - The error context object
 * @returns {string[]} Array of suggestion strings
 * @private
 */
function generateSuggestions(errorType, context) {
  const suggestions = [];

  if (errorType === 'ColumnError') {
    if (context.operation === 'select') {
      suggestions.push('Check that all column names are spelled correctly');
      suggestions.push('Use df.columns to see available columns');
      suggestions.push('Column names are case-sensitive');
    }
  } else if (errorType === 'ValidationError') {
    if (context.operation === 'DataFrame creation') {
      suggestions.push('Ensure all rows have the same number of elements');
      suggestions.push('Verify column names array matches the number of columns');
      suggestions.push('Check that data is a valid 2D array structure');
    }
  } else if (errorType === 'TypeError') {
    if (context.operation === 'mean' || context.operation === 'sum') {
      suggestions.push(`Convert column to numeric type before performing ${context.operation}`);
      suggestions.push('Use df.select() to work with only numeric columns');
      suggestions.push('Check for non-numeric values like strings or null');
    }
  } else if (errorType === 'IndexError') {
    suggestions.push(`Use df.index to check valid row indices`);
    suggestions.push('Row indices are 0-based (first row is index 0)');
  } else if (errorType === 'IOError') {
    if (context.operation === 'readCsv' || context.operation === 'readJson') {
      suggestions.push('Verify the file path is correct and the file exists');
      suggestions.push('Check that you have read permissions for the file');
      suggestions.push('Ensure the file format matches the operation (CSV for readCsv, JSON for readJson)');
    }
  } else if (errorType === 'OperationError') {
    if (context.operation === 'merge') {
      suggestions.push('Specify a valid join key that exists in both DataFrames');
      suggestions.push('Use df.columns to verify column names in both DataFrames');
    }
  }

  return suggestions;
}

/**
 * Formats an error message with context information.
 * Creates a user-friendly error message that includes operation details and suggestions.
 * 
 * @param {string} message - The base error message
 * @param {Object} context - Context information about the error
 * @returns {string} Formatted error message with context
 * @example
 * const msg = formatErrorMessage('Invalid operation', {
 *   operation: 'filter',
 *   column: 'age',
 *   expected: 'numeric column'
 * });
 */
function formatErrorMessage(message, context = {}) {
  let formatted = message;
  
  if (context.operation) {
    formatted += ` during ${context.operation}`;
  }
  
  if (context.column) {
    formatted += ` on column '${context.column}'`;
  }
  
  if (context.expected && context.actual) {
    formatted += ` (expected ${context.expected}, got ${context.actual})`;
  }
  
  return formatted;
}

/**
 * Creates a descriptive error with suggestions for common issues.
 * Wraps error creation with automatic suggestion generation.
 * 
 * @param {string} ErrorClass - The error class to instantiate
 * @param {string} message - The error message
 * @param {Object} context - Context information
 * @returns {Error} An instance of the specified error class
 * @example
 * const error = createError(ColumnError, 'Column not found', {
 *   operation: 'select',
 *   column: 'age'
 * });
 */
function createError(ErrorClass, message, context = {}) {
  const formattedMessage = formatErrorMessage(message, context);
  return new ErrorClass(formattedMessage, context);
}

module.exports = {
  DataFrameError,
  ValidationError,
  TypeError,
  IndexError,
  ColumnError,
  IOError,
  OperationError,
  formatErrorMessage,
  createError,
  generateSuggestions
};
