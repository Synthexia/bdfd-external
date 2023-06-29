export enum RequestCreate {
    Command = 'createCommand',
    Variable = 'createVariable'
}

export enum RequestDelete {
    Command = 'deleteCommand',
    Variable = 'deleteVariable'
}

export enum RequestGet {
    User = 'getUser',
    Command = 'getCommand',
    Variable = 'getVariable',
    BotList = 'getBotList',
    /**
     * Command-Variable List
     */
    CVL = 'getCVL'
}

export enum RequestUpdate {
    Command = 'updateCommand',
    Variable = 'updateVariable'
}


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

export enum RequestMethod {
    Post = 'POST',
    Delete = 'DELETE'
}
