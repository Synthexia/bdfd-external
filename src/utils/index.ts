import type { Data } from "..";
import { APP } from "../consts";
import { RequestStatus, LanguageName, LanguageId } from "../enums";

export const enum Path {
    Home = 'home',
    Bot = 'bot',
    Command = 'command',
    Variable = 'variable',
    NewCommand = 'newCommand',
    NewVariable = 'newVariable'
}

type PathOptions =
    | { type: Path.Home }
    | { type: Path.Command, botId: string, commandId: string }
    | { type: Path.Variable, botId: string, variableId: string }
    | { type: Path.Bot | Path.NewCommand | Path.NewVariable, botId: string };

export function generatePath(options: PathOptions): string {
    switch (options.type) {
        case Path.Home:
            return `${APP}/home`;
        case Path.Bot:
            return `${APP}/bot/${options.botId}`;
        case Path.Command:
            return `${APP}/bot/${options.botId}/command/${options.commandId}`;
        case Path.Variable:
            return `${APP}/bot/${options.botId}/variable/${options.variableId}`;
        case Path.NewCommand:
            return `${APP}/bot/${options.botId}/new_command`;
        case Path.NewVariable:
            return `${APP}/bot/${options.botId}/new_variable`;
    }
}

export const enum ErrorType {
    General = 'general',
    AuthToken = 'authToken',
    Limit = 'limit',
    Missing = 'missing',
    Unknown = 'unknown'
}

export function getErrorData(type: ErrorType, status: RequestStatus): Data.Error {
    const data = <Data.Error> { status };

    switch (type) {
        case ErrorType.General:
            data.message = '[BDFD External - General] Invalid or Non-existent Bot ID / Command ID / Variable ID was passed.';
            break;
        case ErrorType.AuthToken:
            data.message = '[BDFD External - AuthToken] Invalid or Expired auth token was passed.';
            break;
        case ErrorType.Limit:
            data.message = '[BDFD External - Limit] Reached command / variable count limit.';
            break;
        case ErrorType.Missing:
            data.message = '[BDFD External - Missing] Command ID / Variable ID is missing.';
            break;
        case ErrorType.Unknown:
            data.message = '[BDFD External - Unknown] Unknown Error.';
            break;
    }

    data.stack = new Error(data.message).stack!;

    return data;
}

export function checkForError(status: RequestStatus): false | Data.Error {
    switch (status) {
        case RequestStatus.Success:
            return false;
        case RequestStatus.SeeOther:
            return false;
        case RequestStatus.Found:
            return getErrorData(ErrorType.AuthToken, status);
        case RequestStatus.BadRequest:
            return getErrorData(ErrorType.Missing, status);
        case RequestStatus.Forbidden:
            return getErrorData(ErrorType.Limit, status);
        case RequestStatus.NotFound:
            return getErrorData(ErrorType.General, status);
        default:
            return getErrorData(ErrorType.Unknown, status);
    }
}

export function getLanguageIdByName(name: LanguageName): LanguageId {
    switch (name) {
        case LanguageName.BDS:
            return LanguageId.BDS;
        case LanguageName.JS:
            return LanguageId.JS;
        case LanguageName.BDSU:
            return LanguageId.BDSU;
        case LanguageName.BDS2:
            return LanguageId.BDS2;
    }
}
