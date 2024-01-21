import { BDFDExternalRequestError } from ".";
import { APP, REQUEST_ERROR_MESSAGE } from "./consts";
import { RequestStatus, LanguageName, LanguageId, Path, ErrorType } from "./enums";

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

export function getErrorData(type: ErrorType, status: RequestStatus): BDFDExternalRequestError {
    let message: string;

    switch (type) {
        case ErrorType.General:
            message = REQUEST_ERROR_MESSAGE.GENERAL;
            break;
        case ErrorType.AuthToken:
            message = REQUEST_ERROR_MESSAGE.AUTH_TOKEN;
            break;
        case ErrorType.Limit:
            message = REQUEST_ERROR_MESSAGE.COUNT_LIMIT;
            break;
        case ErrorType.Missing:
            message = REQUEST_ERROR_MESSAGE.MISSING_ID;
            break;
        case ErrorType.Unknown:
            message = REQUEST_ERROR_MESSAGE.UNKNOWN;
            break;
    }

    return new BDFDExternalRequestError(status, message);
}

export function checkForError(status: RequestStatus): BDFDExternalRequestError | undefined {
    switch (status) {
        case RequestStatus.Success:
            return;
        case RequestStatus.SeeOther:
            return;
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
