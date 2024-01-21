export enum LanguageId {
    BDS = '0',
    JS = '1',
    BDSU = '2',
    BDS2 = '3'
}

export enum LanguageName {
    BDS = 'BDScript',
    JS = 'Javascript (ES5+BD.js)',
    BDSU = 'BDScript Unstable',
    BDS2 = 'BDScript 2'
}

export enum RequestStatus {
    Unknown = 0,
    Success = 200,
    Found = 302,
    SeeOther = 303,
    BadRequest = 400,
    Forbidden = 403,
    NotFound = 404
}

export enum Create {
    Command = 'CreateCommand',
    Variable = 'CreateVariable'
}

export enum Delete {
    Command = 'DeleteCommand',
    Variable = 'DeleteVariable'
}

export enum Get {
    User = 'GetUser',
    Command = 'GetCommand',
    Variable = 'GetVariable',
    BotList = 'GetBotList',
    CommandVariableList = 'GetCommandVariableList'
}

export enum Update {
    Command = 'UpdateCommand',
    Variable = 'UpdateVariable'
}

export enum Method {
    Post = 'POST',
    Delete = 'DELETE'
}

export enum CommandDivElement {
    Name,
    Trigger,
    Code,
    Language
}

export enum VariableDivElement {
    Name,
    Value
}

export enum CommandVariableListDivElement {
    Command = 1,
    Variable
}

export enum Path {
    Home = 'Home',
    Bot = 'Bot',
    Command = 'Command',
    Variable = 'Variable',
    NewCommand = 'NewCommand',
    NewVariable = 'NewVariable'
}

export const enum ErrorType {
    General = 'Neneral',
    AuthToken = 'AuthToken',
    Limit = 'Limit',
    Missing = 'Missing',
    Unknown = 'Unknown'
}
