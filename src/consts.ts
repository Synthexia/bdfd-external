import type {
    BotPathConstant,
    CaseConstant,
    CommandPathConstant,
    RequestErrorConstant,
    RequestStatusConstant,
    RequestTypeConstant,
    VariablePathConstant
} from "../types/consts";

const APP = 'https://botdesignerdiscord.com/app';

export const
    HOME_PATH = APP + '/home',
    BOT_PATH: BotPathConstant = {
        STATIC: `${APP}/bot/`,
        DYNAMIC: (botID: string) => {
            return `${APP}/bot/${botID};`
        }
    },
    COMMAND_PATH: CommandPathConstant = (botID: string, commandID: string) => {
        return `${BOT_PATH.STATIC + botID}/command/${commandID}`;
    },
    VARIABLE_PATH: VariablePathConstant = (botID: string, variableID: string) => {
        return `${BOT_PATH.STATIC + botID}/variable/${variableID}`;
    },
    NEW_COMMAND_PATH = (botID: string) => {
        return `${BOT_PATH.STATIC + botID}/new_command`;
    },
    NEW_VARIABLE_PATH = (botID: string) => {
        return `${BOT_PATH.STATIC + botID}/new_variable`;
    }
;

export const REQUEST_TYPE = Object.freeze( <RequestTypeConstant> {
    CREATE: {
        COMMAND: 'CREATE_COMMAND',
        VARIABLE: 'CREATE_VARIABLE'
    },
    DELETE: {
        COMMAND: 'DELETE_COMMAND',
        VARIABLE: 'DELETE_VARIABLE'
    },
    GET: {
        COMMAND: 'GET_COMMAND',
        VARIABLE: 'GET_VARIABLE'
    },
    LIST: {
        BOT: 'BOT_LIST',
        COMMAND_VARIABLE: 'COMMAND_VARIABLE_LIST'
    },
    UPDATE: {
        COMMAND: 'UPDATE_COMMAND',
        VARIABLE: 'UPDATE_VARIABLE'
    }
});

export const CASE = Object.freeze( <CaseConstant> {
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

export const REQUEST_STATUS = Object.freeze( <RequestStatusConstant> {
    SUCCESS: 200,
    FOUND: 302,
    SEE_OTHER: 303,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404
});

export const ERROR = Object.freeze( <RequestErrorConstant> {
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
    }
);
