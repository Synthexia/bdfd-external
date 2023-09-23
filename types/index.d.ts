export const enum LanguageId {
    BDS = '0',
    JS = '1',
    BDSU = '2',
    BDS2 = '3'
}

export const enum LanguageName {
    BDS = 'BDScript',
    JS = 'Javascript (ES5+BD.js)',
    BDSU = 'BDScript Unstable',
    BDS2 = 'BDScript 2'
}

export namespace Request {
    namespace Response {
        interface Base {
            error: boolean | Data.Error;
            message: string;
        }

        interface Command extends Omit<Data.Command.Base, 'id'> {}
        interface CommandList extends Omit<Data.Command.Base, 'code' | 'language'> {}
        interface Variable extends Omit<Data.Variable.Base, 'id'> {}
        interface VariableList extends Data.Variable.Base {}
        interface BotList extends Data.Bot.Base {}
    }

    const enum Status {
        Unknown = 0,
        Success = 200,
        Found = 302,
        SeeOther = 303,
        BadRequest = 400,
        Forbidden = 403,
        NotFound = 404
    }
}

export namespace Data {
    interface Error {
        status: Request.Status;
        message: string;
        stack: string;
    }

    namespace Command {
        interface Base {
            id: string;
            name: string;
            trigger: string;
            code: string;
            language: Language;
        }

        interface Partial {
            name: string,
            trigger: string,
            code: string,
            languageName: LanguageName
        }

        interface Language {
            id: LanguageId;
            name: LanguageName;
        }
    }

    namespace Variable {
        interface Base {
            id: string;
            name: string;
            value: string;
        }
    }

    namespace Bot {
        interface Base {
            id: string;
            name: string;
            hosting: string;
            commandCount: string;
            variableCount: string;
        }
    }
}

export class User {
    /**
     * Get an authorized user's username 
     * 
     * @param authToken An auth token
     */
    public static get(authToken: string): Promise<string>;
}

export class Bot {
    /**
     * 
     * Get bot from the bot list by a specified id
     * 
     * @param authToken An auth token
     * @param botId A bot id
     */
    public static get(authToken: string, botId: string): Promise<Request.Response.BotList | undefined>;
    
    /**
     * Get bot list
     * 
     * @param authToken An auth token
     */
    public static list(authToken: string): Promise<Request.Response.BotList[]>;
}

export class Command {
    /**
     * 
     * Get command data
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param commandId A command id
     */
    public static get(authToken: string, botId: string, commandId: string): Promise<Request.Response.Command>;

    /**
     * 
     * Create a new command
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param data The data with which the command will be created
     */
    public static create(authToken: string, botId: string, data: Partial<Data.Command.Partial>): Promise<Data.Command.Base>;

    /**
     * 
     * Update a command
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param commandId A command id
     * @param data The data which should be updated
     */
    public static update(authToken: string, botId: string, commandId: string, data: Partial<Data.Command.Partial>): Promise<Request.Response.Command>;

    /**
     * 
     * Delete a command
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param commandId A command id
     */
    public static delete(authToken: string, botId: string, commandId: string): Promise<Request.Response.Command>;

    /**
     * 
     * Get command list
     * 
     * @param authToken An auth token
     * @param botId A bot id
     */
    public static list(authToken: string, botId: string): Promise<Request.Response.CommandList[]>;
}

export class Variable {
    /**
     * 
     * Get variable data
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param variableId A variable id
     */
    public static get(authToken: string, botId: string, variableId: string): Promise<Request.Response.Variable>;

    /**
     * 
     * Create a new variable
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param data The data with which the variable will be created
     */
    public static create(authToken: string, botId: string, data: Partial<Omit<Data.Variable.Base, 'id'>>): Promise<Data.Variable.Base>;

    /**
     * 
     * Update a variable
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param variableId A variable id
     * @param data The data which should be updated
     */
    public static update(authToken: string, botId: string, variableId: string, data: Partial<Request.Response.Variable>): Promise<Request.Response.Variable>;

    /**
     * 
     * Delete a variable
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param variableId A variable id
     */
    public static delete(authToken: string, botId: string, variableId: string): Promise<Request.Response.Variable>;

    /**
     * 
     * Get variable list
     * 
     * @param authToken An auth token
     * @param botId A bot id
     */
    public static list(authToken: string, botId: string): Promise<Request.Response.VariableList[]>;
}
