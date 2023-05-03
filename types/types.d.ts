type RequestType =
    'CREATE_COMMAND' |
    'CREATE_VARIABLE' |
    'DELETE_COMMAND' |
    'DELETE_VARIABLE' |
    'GET_COMMAND' |
    'GET_VARIABLE' |
    'BOT_LIST' |
    'COMMAND_VARIABLE_LIST' |
    'UPDATE_COMMAND' |
    'UPDATE_VARIABLE'
;

type RequestFunction = Promise<RequestResponse>;

type CommandList = Promise<RequestError | CommandsResponse[]>;
type VariableList = Promise<RequestError | VariablesResponse[]>;
type BotList = Promise<RequestError | BotsResponse[]>;

type GetCommand = Promise<RequestError | CommandResponse>;
type GetVariable = Promise<RequestError | VariableResponse>;

type UpdateCommand = Promise<RequestError | CommandResponse>;
type UpdateVariable = Promise<RequestError | VariableResponse>;

interface RequestResponse {
    error: boolean | RequestError;
    response: Document;
}

interface RequestError {
    /**
     * A HTTP Status code
     */
    status: number;
    /**
     * A description of what might be causing an error
     */
    message: string;
}

interface RequestData  {
    readonly authToken: string;
    readonly botID?: string;
    readonly commandData?: CommandData;
    readonly variableData?: VariableData;
}

interface CommandData {
    /**
     * A BDFD Command ID
     */
    commandID: string;
    commandName?: string;
    commandTrigger?: string;
    commandLanguage?: CommandLanguage;
    commandCode?: string;
}

interface CommandLanguage {
    /**
     * A BDFD Language ID.
     * 
     * Can be used as a replacement for the `name` property but the `id` property has a higher priority
     */
    id?: string;
    /**
     * Can be used as a replacement for the `id` property but the `id` property has a higher priority
     */
    name?: string;
}

interface VariableData {
    /**
     * A BDFD Variable ID
     */
    variableID: string;
    variableName?: string;
    variableValue?: string;
}


interface BaseData {
    /**
     * An Auth token for authorization (aka Cookie which can be obtained from the web app)
     */
    authToken: string;
    /**
     * A BDFD Bot ID 
     */
    botID?: string;
}

export interface VariableResponse {
    variableName: string;
    variableValue: string;
}

export interface VariablesResponse {
    /**
     * A BDFD Variable ID
     */
    variableID: string;
    variableName: string;
    variableValue: string;
}

export interface CommandResponse {
    commandName: string;
    commandTrigger: string;
    /**
     * A Language name
     */
    commandLanguage: string;
    /**
     * A BDFD Language ID
     */
    commandLanguageID: string;
    commandCode: string;
}

export interface CommandsResponse {
    /**
     * A BDFD Command ID
     */
    commandID: string;
    commandName: string;
    commandTrigger: string;
}

export interface BotsResponse {
    /**
     * A BDFD Bot ID
     */
    botID: string;
    botName: string;
    /**
     * The example outputs:
     * 
     * `Hosting already ended`
     * 
     * `2023-05-01T21:40:19Z`
     */
    hostingTime: string;
    /**
     * An example output: `4 commands`
     */
    commandCount: string;
    /**
     * An example output: `4 variables`
     */
    variableCount: string;
}

export declare class Bot {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a bot's info
     */
    static list(baseData: BaseData): BotList;
}

export declare class Command {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandID A BDFD Command ID
     * @returns An object containing command's data
     */
    static get(baseData: BaseData, commandID: string): GetCommand;
    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a command's info
     */
    static list(baseData: BaseData): CommandList;
    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandData An object containing new command's data (with the exception of the `commandID` property)
     * @returns An object containing previous command's data
     */
    static update(baseData: BaseData, commandData: CommandData): UpdateCommand;
}

export declare class Variable {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableID A BDFD Variable ID
     * @returns An object containing variable's data
     */
    static get(baseData: BaseData, variableID: string): GetVariable;
    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a variable's info
     */
    static list(baseData: BaseData): VariableList;
    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableData An object containing new variable's data (with the exception of the `variableID` property)
     * @returns An object containing previous variable's data
     */
    static update(baseData: BaseData, variableData: VariableData): UpdateVariable;
}
