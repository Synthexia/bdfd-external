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
    Command = 'createCommand',
    Variable = 'createVariable'
}

export enum Delete {
    Command = 'deleteCommand',
    Variable = 'deleteVariable'
}

export enum Get {
    User = 'getUser',
    Command = 'getCommand',
    Variable = 'getVariable',
    BotList = 'getBotList',
    CommandVariableList = 'getCommandVariableList'
}

export enum Update {
    Command = 'updateCommand',
    Variable = 'updateVariable'
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
