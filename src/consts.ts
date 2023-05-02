import type { RequestErrorConstant } from "../types/types";

const APP = 'https://botdesignerdiscord.com/app';

export const
    HOME_PATH = APP + '/home',
    BOT_PATH = {
        Static: `${APP}/bot/`,
        Dynamic: (botID: string) => {
            return `${APP}/bot/${botID};`
        }
    },
    COMMAND_PATH = (botID: string, commandID: string) => {
        return `${BOT_PATH.Static + botID}/command/${commandID}`;
    },
    VARIABLE_PATH = (botID: string, variableID: string) => {
        return `${BOT_PATH.Static + botID}/variable/${variableID}`;
    }
;

// TODO edit it
export const REQUEST_TYPE = Object.freeze({
    GetBots: 'getBots',
    GetCommandsAndVariables: 'getCommandsAndVariables',
    GetCommand: 'getCommand',
    GetVariable: 'getVariable',
    UpdateCommand: 'updateCommand',
    UpdateVariable: 'updateVariable',
    CreateCommand: 'createCommand',
    CreateVariable: 'createVariable',
    DeleteCommand: 'deleteCommand',
    DeleteVariable: 'deleteVariable'
});

export const CASE = Object.freeze({
    Command: {
        Name: 0,
        Trigger: 1,
        Code: 2,
        Language: 3
    },
    Variable: {
        Name: 0,
        Value: 1
    }
});

export const REQUEST_STATUS = Object.freeze({
    Success: 200,
    Found: 302,
    BadRequest: 400,
    NotFound: 404
});

export const ERROR = Object.freeze( <RequestErrorConstant> {
    AuthToken(statusCode: number) {
        return {
            status: statusCode,
            message: '[AuthToken] Invalid or Expired auth token was passed.'
        };
    },
    General(statusCode: number) {
        return {
            status: statusCode,
            message: '[General] Invalid or Non-existent Bot ID / Command ID / Variable ID was passed.'
        }
    },
    Missing(statusCode: number) {
        return {
            status: statusCode,
            message: '[Missing] Command ID / Variable ID is missing.'
        }
    },
    Unknown(statusCode: number) {
            return {
                status: statusCode,
                message: '[Unknown] Unknown Error.'

            }
        }
    }
);
