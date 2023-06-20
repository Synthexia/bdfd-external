const APP = 'https://botdesignerdiscord.com/app';

export const HOME_PATH = APP + '/home';
export const BOT_PATH = Object.freeze({
    ROOT: `${APP}/bot`,
    GENERATE: (botID: string) => (
        `${BOT_PATH.ROOT}/${botID}`
    )
});
export const COMMAND_PATH = (botID: string, commandID: string) => (
    `${BOT_PATH.GENERATE(botID)}/command/${commandID}`
);
export const VARIABLE_PATH = (botID: string, variableID: string) => (
    `${BOT_PATH.GENERATE(botID)}/variable/${variableID}`
);
export const NEW_COMMAND_PATH = (botID: string) => (
    `${BOT_PATH.GENERATE(botID)}/new_command`
);
export const NEW_VARIABLE_PATH = (botID: string) => (
    `${BOT_PATH.GENERATE(botID)}/new_variable`
);

export const FORM = 'form';

export const CASE = Object.freeze({
    COMMAND: {
        NAME: 0,
        TRIGGER: 1,
        CODE: 2,
        LANGUAGE: 3
    },
    VARIABLE: {
        NAME: 0,
        VALUE: 1
    }
});

export const enum REQUEST_CREATE {
    COMMAND = 'createCommand',
    VARIABLE = 'createVariable'
}

export const enum REQUEST_DELETE {
    COMMAND = 'deleteCommand',
    VARIABLE = 'deleteVariable'
}

export const enum REQUEST_GET {
    COMMAND = 'getCommand',
    VARIABLE = 'getVariable',
    BOT_LIST = 'getBotList',
    /**
     * Command-Variable List
     */
    CVL = 'getCVL'
}

export const enum REQUEST_UPDATE {
    COMMAND = 'updateCommand',
    VARIABLE = 'updateVariable'
}


export const enum LANGUAGE_ID {
    BDS = '0',
    JS = '1',
    BDSU = '2',
    BDS2 = '3'
}

export const enum LANGUAGE_NAME {
    BDS = 'BDScript',
    JS = 'Javascript (ES5+BD.js)',
    BDSU = 'BDScript Unstable',
    BDS2 = 'BDScript 2'
}

export const enum REQUEST_METHOD {
    POST = 'POST',
    DELETE = 'DELETE'
}

export const REQUEST_STATUS = Object.freeze({
    SUCCESS: 200,
    FOUND: 302,
    SEE_OTHER: 303,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404
});

export const START_ATTEMPT = 0;
export const START_TIMEOUT = 5000;
export const MAX_REQUEST_ATTEMPTS = 5;
export const RE_REQUEST_INTERVAL = 10;
export const REQUEST_FAILED = Object.freeze({
    RETRY: (attempt: number) => (
        `Failed to request, retry in ${RE_REQUEST_INTERVAL}ms, ${MAX_REQUEST_ATTEMPTS - attempt} attempts left`
    ),
    NO_RETRY: 'Failed to request, will not retry! Details:\n'
});

export const ERROR = Object.freeze({
    AUTH_TOKEN(statusCode: number) {
        return {
            status: statusCode,
            message: '[AuthToken] Invalid or Expired auth token was passed.'
        };
    },
    GENERAL(statusCode: number) {
        return {
            status: statusCode,
            message: '[General] Invalid or Non-existent Bot ID / Command ID / Variable ID was passed.'
        }
    },
    LIMIT(statusCode: number) {
        return {
            status: statusCode,
            message: '[Limit] Reached command / variable count limit.'
        }
    },
    MISSING(statusCode: number) {
        return {
            status: statusCode,
            message: '[Missing] Command ID / Variable ID is missing.'
        }
    },
    UNKNOWN(statusCode: number) {
        return {
            status: statusCode,
            message: '[Unknown] Unknown Error.'
        }
    }
});
