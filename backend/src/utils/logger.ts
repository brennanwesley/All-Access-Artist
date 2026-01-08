/**
 * Structured Logger Utility
 * All Access Artist - Backend API v2.0.0
 * 
 * Provides consistent, structured logging across the application.
 * Designed to work in both Node.js and edge runtime environments.
 * 
 * Log Levels:
 * - debug: Detailed debugging information (development only)
 * - info: General operational information
 * - warn: Warning conditions that don't prevent operation
 * - error: Error conditions that need attention
 * 
 * Usage:
 *   import { logger } from '../utils/logger.js'
 *   logger.info('User logged in', { userId: '123' })
 *   logger.error('Database error', { error: err.message, operation: 'createRelease' })
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  requestId?: string
  userId?: string
  service?: string
}

// Environment-based log level threshold
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

// Get minimum log level from environment (default: 'info' in production, 'debug' in development)
function getMinLogLevel(): LogLevel {
  const env = process.env.NODE_ENV || 'development'
  const configuredLevel = process.env.LOG_LEVEL as LogLevel | undefined
  
  if (configuredLevel && LOG_LEVELS[configuredLevel] !== undefined) {
    return configuredLevel
  }
  
  return env === 'production' ? 'info' : 'debug'
}

// Check if a log level should be output
function shouldLog(level: LogLevel): boolean {
  const minLevel = getMinLogLevel()
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel]
}

// Format log entry as structured JSON
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry)
}

// Create a child logger with preset context
export function createLogger(service: string, defaultContext?: LogContext) {
  return {
    debug: (message: string, context?: LogContext) => 
      log('debug', message, { ...defaultContext, ...context, service }),
    
    info: (message: string, context?: LogContext) => 
      log('info', message, { ...defaultContext, ...context, service }),
    
    warn: (message: string, context?: LogContext) => 
      log('warn', message, { ...defaultContext, ...context, service }),
    
    error: (message: string, context?: LogContext) => 
      log('error', message, { ...defaultContext, ...context, service }),
    
    // Create a child logger with additional context
    child: (additionalContext: LogContext) => 
      createLogger(service, { ...defaultContext, ...additionalContext })
  }
}

// Core logging function
function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) {
    return
  }

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && { context })
  }

  const formattedEntry = formatLogEntry(entry)

  // Use appropriate console method based on level
  switch (level) {
    case 'debug':
      console.debug(formattedEntry)
      break
    case 'info':
      console.info(formattedEntry)
      break
    case 'warn':
      console.warn(formattedEntry)
      break
    case 'error':
      console.error(formattedEntry)
      break
  }
}

// Default logger instance
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  
  // Create a child logger for a specific service/module
  child: (service: string, context?: LogContext) => createLogger(service, context)
}

// Request-scoped logger factory
export function createRequestLogger(requestId: string, userId?: string) {
  return {
    debug: (message: string, context?: LogContext) => 
      log('debug', message, { ...context, requestId, userId }),
    
    info: (message: string, context?: LogContext) => 
      log('info', message, { ...context, requestId, userId }),
    
    warn: (message: string, context?: LogContext) => 
      log('warn', message, { ...context, requestId, userId }),
    
    error: (message: string, context?: LogContext) => 
      log('error', message, { ...context, requestId, userId })
  }
}

// Utility to safely extract error information for logging
export function extractErrorInfo(error: unknown): LogContext {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
  
  if (typeof error === 'string') {
    return { errorMessage: error }
  }
  
  return { errorMessage: String(error) }
}

export default logger
