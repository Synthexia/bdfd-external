export const APP = 'https://botdesignerdiscord.com/app';

export const FORM = 'form';

export const DEFAULT_SESSION_STORE = 'default-sessionStore';

export const START_ATTEMPT = 0;
export const START_TIMEOUT = 5000;
export const MAX_REQUEST_ATTEMPTS = 5;
export const RE_REQUEST_INTERVAL = 10;
export const REQUEST_FAILED = {
    RETRY: (attempt: number) => `[BDFD External - Request] Failed to request, retry in ${RE_REQUEST_INTERVAL}ms, ${MAX_REQUEST_ATTEMPTS - attempt} attempts left`,
    NO_RETRY: '[BDFD External - Request] Failed to request, will not retry! Details:\n'
} as const;

export const REQUEST_ERROR_MESSAGE = {
    GENERAL: '[BDFD External - General] Invalid or Non-existent Bot ID / Command ID / Variable ID was passed.',
    AUTH_TOKEN: '[BDFD External - AuthToken] Invalid or Expired auth token was passed.',
    COUNT_LIMIT: '[BDFD External - Limit] Reached command / variable count limit.',
    MISSING_ID: '[BDFD External - Missing] Command ID / Variable ID is missing.',
    UNKNOWN: '[BDFD External - Unknown] Unknown Error.'
} as const;
