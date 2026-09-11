/**
 * Supabase & Network Error Handling with Rate-Limit / Quota Protection
 * Compliant with Section 16 & 21 of the Migration Requirements.
 */

export enum AppErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  PROVIDER_DISABLED = 'PROVIDER_DISABLED',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppErrorDetails {
  code: AppErrorCode;
  message: string;
  originalError?: any;
  retryAfterSeconds?: number;
  isRetryable: boolean;
}

export function parseSupabaseError(error: any): AppErrorDetails {
  if (!error) {
    return {
      code: AppErrorCode.UNKNOWN_ERROR,
      message: 'An unknown error occurred.',
      isRetryable: false,
    };
  }

  const rawMsg = error.msg || error.message || error.error_description || error.error || String(error);
  const message = String(rawMsg).toLowerCase();
  const status = error.status || error.code || error.error_code;

  // Specific Supabase Auth errors
  if (message.includes('invalid login credentials') || message.includes('invalid_grant')) {
    return {
      code: AppErrorCode.AUTH_ERROR,
      message: 'Invalid email or password. Please check your credentials and try again.',
      isRetryable: false,
      originalError: error,
    };
  }

  if (message.includes('user already registered') || message.includes('already exists') || message.includes('user_already_exists')) {
    return {
      code: AppErrorCode.VALIDATION_ERROR,
      message: 'An account with this email already exists. Please sign in instead.',
      isRetryable: false,
      originalError: error,
    };
  }

  if (message.includes('username') && (message.includes('already taken') || message.includes('unique constraint') || message.includes('duplicate key'))) {
    return {
      code: AppErrorCode.VALIDATION_ERROR,
      message: 'This username is already taken. Please choose another one.',
      isRetryable: false,
      originalError: error,
    };
  }

  if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
    return {
      code: AppErrorCode.AUTH_ERROR,
      message: 'Please check your email inbox to confirm your account before signing in.',
      isRetryable: false,
      originalError: error,
    };
  }

  if (message.includes('password should be at least') || message.includes('weak_password')) {
    return {
      code: AppErrorCode.VALIDATION_ERROR,
      message: 'Password must be at least 6 characters long.',
      isRetryable: false,
      originalError: error,
    };
  }

  // Rate Limit / 429 / Quota
  if (status === 429 || message.includes('too many requests') || message.includes('rate limit')) {
    let retryAfter = 5;
    if (error.headers && typeof error.headers.get === 'function') {
      const hVal = error.headers.get('Retry-After');
      if (hVal) retryAfter = parseInt(hVal, 10) || 5;
    }
    return {
      code: AppErrorCode.RATE_LIMIT,
      message: `Too many requests. Please wait ${retryAfter}s before retrying.`,
      retryAfterSeconds: retryAfter,
      isRetryable: true,
      originalError: error,
    };
  }

  if (message.includes('quota') || message.includes('exceeded')) {
    return {
      code: AppErrorCode.QUOTA_EXCEEDED,
      message: 'Service quota reached. Please try again later.',
      isRetryable: false,
      originalError: error,
    };
  }

  // Network / Offline
  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('connection refused')
  ) {
    return {
      code: AppErrorCode.NETWORK_ERROR,
      message: 'Connection issue detected. Reconnecting automatically...',
      isRetryable: true,
      originalError: error,
    };
  }

  // Auth / Permissions / API Key
  if (message.includes('no api key') || message.includes('apikey') || message.includes('api key')) {
    return {
      code: AppErrorCode.AUTH_ERROR,
      message: 'Supabase API key is missing or invalid. Please check your VITE_SUPABASE_ANON_KEY.',
      isRetryable: false,
      originalError: error,
    };
  }

  if (status === 401 || message.includes('jwt') || message.includes('unauthorized') || message.includes('not logged in')) {
    return {
      code: AppErrorCode.AUTH_ERROR,
      message: 'Your session has expired or requires sign in.',
      isRetryable: false,
      originalError: error,
    };
  }

  if (status === 403 || message.includes('row-level security') || message.includes('permission denied')) {
    return {
      code: AppErrorCode.PERMISSION_ERROR,
      message: 'Access denied by privacy policy.',
      isRetryable: false,
      originalError: error,
    };
  }

  if (status === 404 || message.includes('not found')) {
    return {
      code: AppErrorCode.NOT_FOUND,
      message: 'Requested record was not found.',
      isRetryable: false,
      originalError: error,
    };
  }

  // Validation
  if (status === 400 || message.includes('invalid') || message.includes('violates foreign key')) {
    return {
      code: AppErrorCode.VALIDATION_ERROR,
      message: error.message || 'Invalid data provided.',
      isRetryable: false,
      originalError: error,
    };
  }

  return {
    code: AppErrorCode.SERVER_ERROR,
    message: error.message || 'An unexpected backend error occurred.',
    isRetryable: false,
    originalError: error,
  };
}

/**
 * Executes an async operation with bounded exponential backoff.
 * Guaranteed never to loop infinitely (max 3 retries).
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (attempt: number, delayMs: number) => void;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelay = options.initialDelayMs ?? 800;
  const maxDelay = options.maxDelayMs ?? 5000;

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;
      const parsed = parseSupabaseError(err);
      if (!parsed.isRetryable || attempt > maxRetries) {
        throw err;
      }
      const delay = Math.min(
        maxDelay,
        (parsed.retryAfterSeconds ? parsed.retryAfterSeconds * 1000 : initialDelay * Math.pow(2, attempt - 1)) +
          Math.random() * 200
      );
      options.onRetry?.(attempt, delay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
