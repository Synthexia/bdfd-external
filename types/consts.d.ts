import type { RequestError } from "./types";

interface BotPathConstant {
    STATIC: string,
    DYNAMIC: BPCDynamic
}

type BPCDynamic = (botID: string) => string;

type CommandPathConstant = (botID: string, commandID: string) => string;
type VariablePathConstant = (botID: string, variableID: string) => string;

interface RequestErrorConstant {
    AUTH_TOKEN(statusCode: number): RequestError;
    GENERAL(statusCode: number): RequestError;
    LIMIT(statusCode: number): RequestError;
    MISSING(statusCode: number): RequestError;
    UNKNOWN(statusCode: number): RequestError;
}

interface RequestTypeConstant {
    CREATE: RTCCreate,
    DELETE: RTCDelete,
    GET: RTCGet,
    LIST: RTCList,
    UPDATE: RTCUpdate
}

interface RTCCreate {
    COMMAND: 'CREATE_COMMAND',
    VARIABLE: 'CREATE_VARIABLE'
}

interface RTCDelete {
    COMMAND: 'DELETE_COMMAND',
    VARIABLE: 'DELETE_VARIABLE'
}

interface RTCGet {
    COMMAND: 'GET_COMMAND',
    VARIABLE: 'GET_VARIABLE'
}

interface RTCList {
    BOT: 'BOT_LIST',
    COMMAND_VARIABLE: 'COMMAND_VARIABLE_LIST'
}

interface RTCUpdate {
    COMMAND: 'UPDATE_COMMAND',
    VARIABLE: 'UPDATE_VARIABLE'
}

interface CaseConstant {
    COMMAND: CCComand,
    VARIABLE: CCVariable
}

interface CCComand {
    NAME: 0,
    TRIGGER: 1,
    CODE: 2,
    LANGUAGE: 3
}

interface CCVariable {
    NAME: 0,
    VALUE: 1
}

interface RequestStatusConstant {
    SUCCESS: 200,
    FOUND: 302,
    SEE_OTHER: 303,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404
}