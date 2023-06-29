export namespace Request {
    namespace Response {
        interface Request {
            error: boolean | Error;
            response: Document;
        }

        interface Command extends Omit<Data.Command.Data, 'commandID'> { }
        interface Commands extends Omit<Data.Command.Data, 'commandLanguage' | 'commandCode'> { }
        interface Variable extends Omit<Data.Variable.Data, 'variableID'> { }
        interface Variables extends Data.Variable.Data { }
        interface Bots extends Data.Bot.Data { }
    }

    interface Error {
        /**
         * A HTTP Status code
         */
        status: number;
        /**
         * A description of what might be causing an error
         */
        message: string;
    }

    namespace Data {
        interface Base {
            /**
             * An Auth token for authorization (aka Cookie which can be obtained from the web app)
             */
            authToken: string;
            /**
             * A BDFD Bot ID 
             */
            botID: string;
        }

        interface Request {
            /**
             * An Auth token for authorization (aka Cookie which can be obtained from the web app)
             */
            readonly authToken: string;
            /**
             * A BDFD Bot ID 
             */
            readonly botID?: string;
            /**
             * A Command Data
             */
            readonly commandData?: Partial<Command.Data>;
            /**
             * A Variable Data
             */
            readonly variableData?: Partial<Variable.Data>;
        }

        namespace Command {
            interface Data {
                /**
                 * A BDFD Command ID
                 */
                commandID: string;
                commandName: string;
                commandTrigger: string;
                commandLanguage: LanguageData;
                commandCode: string;
            }

            interface LanguageData {
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
        }

        namespace Variable {
            interface Data {
                /**
                 * A BDFD Variable ID
                 */
                variableID: string;
                variableName: string;
                variableValue: string;
            }
        }

        namespace Bot {
            interface Data {
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
        }
    }
}

export class User {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An authorized user's username
     */
    static get(baseData: Omit<Request.Data.Base, 'botID'>): Promise<string>;
}

export class Bot {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a bot's info
     */
    static list(baseData: Omit<Request.Data.Base, 'botID'>): Promise<Request.Response.Bots[]>;
}

export class Command {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandData An object containing new command's data
     * @returns An object containing created command's data
     */
    static create(baseData: Request.Data.Base, commandData: Partial<Omit<Request.Data.Command.Data, 'commandID'>>): Promise<Request.Data.Command.Data>;

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandID A BDFD Command ID
     * @returns An object containing deleted command's data
     */
    static delete(baseData: Request.Data.Base, commandID: string): Promise<Request.Response.Command>;

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandID A BDFD Command ID
     * @returns An object containing command's data
     */
    static get(baseData: Request.Data.Base, commandID: string): Promise<Request.Response.Command>;

    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a command's info
     */
    static list(baseData: Request.Data.Base): Promise<Request.Response.Commands[]>;

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandData An object containing old command's data (with the exception of the `commandID` property)
     * @param commandID A BDFD Command ID
     * @returns An object containing previous command's data
     */
    static update(baseData: Request.Data.Base, commandData: Partial<Omit<Request.Data.Command.Data, 'commandID'>>, commandID: string): Promise<Request.Response.Command>;
}

export class Variable {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableData An object containing new variable's data (with the exception of the `variableID` property)
     * @returns An object containing created variable's data
     */
    static create(baseData: Request.Data.Base, variableData: Partial<Omit<Request.Data.Variable.Data, 'variableID'>>): Promise<Request.Data.Variable.Data>;

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableID A BDFD Variable ID
     * @returns An object containing deleted variable's data
     */
    static delete(baseData: Request.Data.Base, variableID: string): Promise<Request.Response.Variable>;

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableID A BDFD Variable ID
     * @returns An object containing variable's data
     */
    static get(baseData: Request.Data.Base, variableID: string): Promise<Request.Response.Variable>;

    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a variable's info
     */
    static list(baseData: Request.Data.Base): Promise<Request.Response.Variables[]>;

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableData An object containing old variable's data (with the exception of the `variableID` property)
     * @param variableID A BDFD Variable ID
     * @returns An object containing previous variable's data
     */
    static update(baseData: Request.Data.Base, variableData: Partial<Omit<Request.Data.Variable.Data, 'variableID'>>, variableID: string): Promise<Request.Response.Variable>;
}
