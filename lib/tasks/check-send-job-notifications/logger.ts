export const logger = {
  info: (message: string, meta: Record<string, unknown> = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...meta
    }))
  },
  
  error: (message: string, error?: unknown, meta: Record<string, unknown> = {}) => {
    let errorMessage: string | unknown = error;
    let errorStack: string | undefined = undefined;
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as Error).message;
      errorStack = (error as Error).stack;
    }
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: errorMessage,
      stack: errorStack,
      ...meta
    }))
  },
  
  warn: (message: string, meta: Record<string, unknown> = {}) => {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      ...meta
    }))
  }
} 