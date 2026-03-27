import pino from 'pino';

/**
 * Structured logger using Pino
 * Logs are JSON formatted for easy parsing and analysis
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV || 'development',
  },
});

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>
): void {
  logger.warn(
    {
      type: 'security',
      event,
      ...details,
    },
    `Security Event: ${event}`
  );
}

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'csrfToken'];

function redactSensitive(obj: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!obj) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const keyLower = k.toLowerCase();
    if (SENSITIVE_KEYS.some((sk) => keyLower.includes(sk))) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Error)) {
      out[k] = redactSensitive(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Log API errors
 */
export function logApiError(
  endpoint: string,
  error: Error | unknown,
  metadata?: Record<string, unknown>
): void {
  const errorDetails = error instanceof Error 
    ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      }
    : { error: String(error) };

  logger.error(
    {
      type: 'api_error',
      endpoint,
      ...errorDetails,
      ...redactSensitive(metadata),
    },
    `API Error: ${endpoint}`
  );
}

/**
 * Log database operations
 */
export function logDatabaseOperation(
  operation: string,
  details: Record<string, unknown>
): void {
  logger.info(
    {
      type: 'database',
      operation,
      ...details,
    },
    `Database Operation: ${operation}`
  );
}

export default logger;

