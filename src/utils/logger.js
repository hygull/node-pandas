/**
 * @fileoverview Warning and logging system for the node-pandas library.
 * Provides configurable logging levels and deprecation/usage warnings.
 * 
 * Validates: Requirements 18.6, 16.4
 */

/**
 * Logging levels for the logger system.
 * @enum {number}
 */
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * Logger class for managing warnings and log messages.
 * Supports configurable logging levels and different message types.
 * 
 * @class Logger
 * @example
 * const logger = new Logger({ level: LogLevel.WARN });
 * logger.warn('This is a warning');
 * logger.deprecation('oldMethod', 'newMethod');
 */
class Logger {
  /**
   * Creates a new Logger instance.
   * 
   * @param {Object} options - Configuration options
   * @param {number} options.level - Logging level (ERROR, WARN, INFO, DEBUG)
   * @param {boolean} options.enabled - Whether logging is enabled (default: true)
   * @param {string} options.prefix - Prefix for all log messages (default: '[node-pandas]')
   */
  constructor(options = {}) {
    this.level = options.level !== undefined ? options.level : LogLevel.WARN;
    this.enabled = options.enabled !== false;
    this.prefix = options.prefix || '[node-pandas]';
    this.deprecatedFeatures = new Set();
  }

  /**
   * Logs an error message.
   * Always logged regardless of level (level 0).
   * 
   * @param {string} message - The error message
   * @param {Object} context - Additional context information
   * @example
   * logger.error('Operation failed', { operation: 'merge' });
   */
  error(message, context = {}) {
    if (!this.enabled) return;
    this._log('ERROR', message, context);
  }

  /**
   * Logs a warning message.
   * Logged when level >= WARN (1).
   * 
   * @param {string} message - The warning message
   * @param {Object} context - Additional context information
   * @example
   * logger.warn('Large dataset detected', { rows: 100000 });
   */
  warn(message, context = {}) {
    if (!this.enabled || this.level < LogLevel.WARN) return;
    this._log('WARN', message, context);
  }

  /**
   * Logs an info message.
   * Logged when level >= INFO (2).
   * 
   * @param {string} message - The info message
   * @param {Object} context - Additional context information
   * @example
   * logger.info('DataFrame created', { rows: 1000, columns: 5 });
   */
  info(message, context = {}) {
    if (!this.enabled || this.level < LogLevel.INFO) return;
    this._log('INFO', message, context);
  }

  /**
   * Logs a debug message.
   * Logged when level >= DEBUG (3).
   * 
   * @param {string} message - The debug message
   * @param {Object} context - Additional context information
   * @example
   * logger.debug('Processing row', { index: 42 });
   */
  debug(message, context = {}) {
    if (!this.enabled || this.level < LogLevel.DEBUG) return;
    this._log('DEBUG', message, context);
  }

  /**
   * Logs a deprecation warning for a feature.
   * Only logs once per deprecated feature to avoid spam.
   * 
   * @param {string} oldFeature - The deprecated feature name
   * @param {string} newFeature - The recommended replacement feature
   * @param {Object} context - Additional context information
   * @example
   * logger.deprecation('oldMethod', 'newMethod');
   * // Output: [node-pandas] DEPRECATION: oldMethod is deprecated, use newMethod instead
   */
  deprecation(oldFeature, newFeature, context = {}) {
    if (!this.enabled || this.level < LogLevel.WARN) return;
    
    // Only warn once per deprecated feature
    if (this.deprecatedFeatures.has(oldFeature)) return;
    this.deprecatedFeatures.add(oldFeature);
    
    const message = `${oldFeature} is deprecated, use ${newFeature} instead`;
    this._log('DEPRECATION', message, context);
  }

  /**
   * Logs a usage warning for potentially problematic patterns.
   * 
   * @param {string} message - The warning message
   * @param {Object} context - Additional context information
   * @example
   * logger.usageWarning('Large DataFrame operation', { rows: 1000000 });
   */
  usageWarning(message, context = {}) {
    if (!this.enabled || this.level < LogLevel.WARN) return;
    this._log('USAGE_WARNING', message, context);
  }

  /**
   * Sets the logging level.
   * 
   * @param {number} level - The new logging level
   * @example
   * logger.setLevel(LogLevel.DEBUG);
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Enables or disables logging.
   * 
   * @param {boolean} enabled - Whether logging should be enabled
   * @example
   * logger.setEnabled(false); // Disable all logging
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Gets the current logging level.
   * 
   * @returns {number} The current logging level
   */
  getLevel() {
    return this.level;
  }

  /**
   * Checks if logging is enabled.
   * 
   * @returns {boolean} Whether logging is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Internal method to format and output log messages.
   * 
   * @private
   * @param {string} type - The log type (ERROR, WARN, INFO, DEBUG, etc.)
   * @param {string} message - The message to log
   * @param {Object} context - Additional context information
   */
  _log(type, message, context = {}) {
    let output = `${this.prefix} ${type}: ${message}`;
    
    if (Object.keys(context).length > 0) {
      const contextStr = Object.entries(context)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(', ');
      output += ` (${contextStr})`;
    }
    
    // Use appropriate console method based on type
    if (type === 'ERROR') {
      console.error(output);
    } else if (type === 'WARN' || type === 'DEPRECATION' || type === 'USAGE_WARNING') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }
}

/**
 * Global logger instance for the library.
 * Can be configured by users to control logging behavior.
 * 
 * @type {Logger}
 */
const globalLogger = new Logger({
  level: LogLevel.WARN,
  enabled: true,
  prefix: '[node-pandas]'
});

/**
 * Gets the global logger instance.
 * 
 * @returns {Logger} The global logger instance
 * @example
 * const logger = getLogger();
 * logger.warn('Something might be wrong');
 */
function getLogger() {
  return globalLogger;
}

/**
 * Creates a new logger instance with custom configuration.
 * 
 * @param {Object} options - Configuration options
 * @returns {Logger} A new logger instance
 * @example
 * const customLogger = createLogger({ level: LogLevel.DEBUG });
 */
function createLogger(options = {}) {
  return new Logger(options);
}

/**
 * Resets the global logger to default configuration.
 * 
 * @example
 * resetLogger();
 */
function resetLogger() {
  globalLogger.setLevel(LogLevel.WARN);
  globalLogger.setEnabled(true);
  globalLogger.deprecatedFeatures.clear();
}

module.exports = {
  Logger,
  LogLevel,
  getLogger,
  createLogger,
  resetLogger
};
