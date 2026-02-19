export type LoggerContext = Record<string, unknown>

type LoggerLevel = 'debug' | 'info' | 'warn' | 'error'

const isDevelopment = import.meta.env.DEV

function shouldLog(level: LoggerLevel): boolean {
  if (isDevelopment) {
    return true
  }

  return level === 'warn' || level === 'error'
}

function write(level: LoggerLevel, message: string, context?: LoggerContext): void {
  if (!shouldLog(level)) {
    return
  }

  const formattedMessage = `[frontend] ${message}`

  switch (level) {
    case 'debug':
      if (context) {
        console.debug(formattedMessage, context)
      } else {
        console.debug(formattedMessage)
      }
      break
    case 'info':
      if (context) {
        console.info(formattedMessage, context)
      } else {
        console.info(formattedMessage)
      }
      break
    case 'warn':
      if (context) {
        console.warn(formattedMessage, context)
      } else {
        console.warn(formattedMessage)
      }
      break
    case 'error':
      if (context) {
        console.error(formattedMessage, context)
      } else {
        console.error(formattedMessage)
      }
      break
  }
}

export const logger = {
  debug: (message: string, context?: LoggerContext) => write('debug', message, context),
  info: (message: string, context?: LoggerContext) => write('info', message, context),
  warn: (message: string, context?: LoggerContext) => write('warn', message, context),
  error: (message: string, context?: LoggerContext) => write('error', message, context),
}
