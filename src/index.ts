import * as centra from "centra";
import { JSDOM } from "jsdom";

import {
    DEFAULT_SESSION_STORE,
    FORM,
    MAX_REQUEST_ATTEMPTS,
    REQUEST_ERROR_MESSAGE,
    REQUEST_FAILED,
    RE_REQUEST_INTERVAL,
    START_ATTEMPT,
    START_TIMEOUT
} from "./consts";

import {
    checkForError,
    generatePath,
    getErrorData,
    getLanguageIdByName
} from "./utils";

import {
    RequestStatus,
    LanguageName,
    LanguageId,
    Get,
    Create,
    Delete,
    Update,
    Method,
    CommandDivElement,
    CommandVariableListDivElement,
    VariableDivElement,
    Path,
    ErrorType
} from "./enums";

export declare namespace Data {
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

        interface Partial {
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

    namespace Request {

        namespace Response {
            interface Base {
                error: BDFDExternalRequestError | undefined;
                response: Document;
            }
        }

        namespace Body {
            interface Command {
                /**
                 * Command name
                 */
                name: string;
                /**
                 * Command trigger
                 */
                command: string;
                /**
                 * Command code
                 */
                replyMessage: string;
                /**
                 * Language ID
                 */
                language: LanguageId;
            }
            
            interface Variable {
                /**
                 * Variable name
                 */
                name: string;
                /**
                 * Variable value
                 */
                value: string;
            }
        }
    }
}

type OmitId<T> = Omit<T, 'id'>;
type OmitCode<T> = Omit<T, 'code'>;
type OmitLanguage<T> = Omit<T, 'language'>;

type RequestOptions =
    | { type: Get.User | Get.BotList }
    | { type: Get.CommandVariableList | Create.Command | Create.Variable, botId: string }
    | { type: Get.Command | Delete.Command, botId: string, commandId: string }
    | { type: Get.Variable | Delete.Variable, botId: string, variableId: string }
    | { type: Update.Command, botId: string, commandId: string, data: Data.Command.Partial }
    | { type: Update.Variable, botId: string, variableId: string, data: { name: string, value: string } };

export class BDFDExternalRequestError extends Error {
    public statusCode: RequestStatus;

    constructor(statusCode: RequestStatus, message: string) {
        super(message);

        this.statusCode = statusCode;
    }
}

export const RequestErrorMessage = REQUEST_ERROR_MESSAGE;

async function makeRequest(options: RequestOptions, authToken: string): Promise<Data.Request.Response.Base> {
    if (
        !authToken.includes(DEFAULT_SESSION_STORE) &&
        authToken.split('=')[0] != DEFAULT_SESSION_STORE
    ) authToken = `${DEFAULT_SESSION_STORE}=${authToken}`;

    let centraRequest: centra.Request;

    switch (options.type) {
        case Get.User:
            centraRequest = centra(generatePath({ type: Path.Home }));
            break;
        case Get.BotList:
            centraRequest = centra(generatePath({ type: Path.Home }));
            break;
        case Get.Command:
            centraRequest = centra(generatePath({
                type: Path.Command,
                botId: options.botId,
                commandId: options.commandId
            }));
            break;
        case Get.Variable:
            centraRequest = centra(generatePath({
                type: Path.Variable,
                botId: options.botId,
                variableId: options.variableId
            }));
            break;
        case Get.CommandVariableList:
            centraRequest = centra(generatePath({
                type: Path.Bot,
                botId: options.botId
            }));
            break;
        case Create.Command:
            centraRequest = centra(generatePath({
                type: Path.NewCommand,
                botId: options.botId
            }));
            break;
        case Create.Variable:
            centraRequest = centra(generatePath({
                type: Path.NewVariable,
                botId: options.botId
            }));
            break;
        case Delete.Command:
            centraRequest = centra(generatePath({
                type: Path.Command,
                botId: options.botId,
                commandId: options.commandId
            }), Method.Delete);
            break;
        case Delete.Variable:
            centraRequest = centra(generatePath({
                type: Path.Variable,
                botId: options.botId,
                variableId: options.variableId
            }), Method.Delete);
            break;
        case Update.Command:
            centraRequest = centra(generatePath({
                type: Path.Command,
                botId: options.botId,
                commandId: options.commandId
            }), Method.Post).body({
                name: options.data.name,
                command: options.data.trigger,
                replyMessage: options.data.code,
                language: getLanguageIdByName(options.data.languageName)
            } satisfies Data.Request.Body.Command, FORM);
            break;
        case Update.Variable:
            centraRequest = centra(generatePath({
                type: Path.Variable,
                botId: options.botId,
                variableId: options.variableId
            }), Method.Post).body({
                name: options.data.name,
                value: options.data.value
            } satisfies Data.Request.Body.Variable, FORM);
            break;
    }
    
    const centraResponse = await new Promise<centra.Response>((resolve, reject) => {
        const request = centraRequest
            .header('cookie', authToken)
            .timeout(START_TIMEOUT);
        
        let attempt = START_ATTEMPT;
        let timeout = START_TIMEOUT;

        function sendRequest() {
            request.send()
                .then((response) => resolve(response))
                .catch((error) => {
                    attempt++;
                    timeout += 1000;

                    if (attempt == MAX_REQUEST_ATTEMPTS) {
                        console.error(REQUEST_FAILED.NO_RETRY, error);

                        reject(getErrorData(ErrorType.Unknown, RequestStatus.Unknown));
                    } else {
                        console.info(REQUEST_FAILED.RETRY(attempt));

                        setTimeout(() => {
                            request.timeout(timeout);
                            sendRequest();
                        }, RE_REQUEST_INTERVAL);
                    }
                });
        }

        sendRequest();
    });

    const response = await centraResponse.text();
    const status = <RequestStatus> centraResponse.statusCode;

    return {
        error: checkForError(status),
        response: new JSDOM(response).window.document
    };
}

export class User {
    /**
     * Get an authorized user's username 
     * 
     * @param authToken An auth token
     */
    public static async get(authToken: string): Promise<string> {
        const document = await makeRequest({ type: Get.User }, authToken);

        if (document.error) throw document.error;

        const [divider] = document.response.getElementsByClassName('uk-heading-divider');
        const [child] = divider.children;
        const username = child.textContent!;

        return username;
    }
}

export class Bot {
    /**
     * 
     * Get bot from the bot list by a specified id
     * 
     * @param authToken An auth token
     * @param botId A bot id
     */
    public static async get(authToken: string, botId: string): Promise<Data.Bot.Base | undefined> {
        const botList = await Bot.list(authToken);
        
        const bot = botList.find((bot) => bot.id == botId);

        return bot;
    }

    /**
     * Get bot list
     * 
     * @param authToken An auth token
     */
    public static async list(authToken: string): Promise<Data.Bot.Base[]> {
        const document = await makeRequest({ type: Get.BotList }, authToken);

        if (document.error) throw document.error;

        const botCards = document.response.getElementsByClassName('botCard');
        const botList: Data.Bot.Base[] = [];
        
        for (const botCard of botCards) {
            const texts = botCard
                .getElementsByTagName('p')[0]
                .textContent!
                .replace(/\t/g, '')
                .split('\n');
            
            const botId = (botCard as HTMLAnchorElement)
                .href
                .split('/')
                .pop() ?? '';
            const botName = botCard
                .getElementsByClassName('uk-card-title')[0]
                .textContent || '';
    
            let hostingTime = texts[2];
            let commandCount = '';
            let variableCount = '';
    
            if (hostingTime == 'Hosting already ended') {
                commandCount = texts[5].trim();
                variableCount = texts[6].trim();
            } else {
                const innerHTML = botCard
                    .getElementsByTagName('p')[0]
                    .innerHTML;
                const rawHostingTimeDate = innerHTML
                    .split('"date: ')[1]
                    .split('">')[0];
    
                hostingTime = rawHostingTimeDate;
                commandCount = texts[10].trim();
                variableCount = texts[11].trim();
            }
    
            botList.push({
                id: botId,
                name: botName,
                hosting: hostingTime,
                commandCount,
                variableCount
            });
        }
    
        return botList;
    }
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
    public static async get(authToken: string, botId: string, commandId: string): Promise<OmitId<Data.Command.Base>> {
        const document = await makeRequest({
            type: Get.Command,
            botId,
            commandId
        }, authToken);

        if (document.error) throw document.error;
    
        const divs = document.response.getElementsByClassName('uk-margin')
    
        let name!: string;
        let trigger!: string;
        let code!: string;
        const language = <Data.Command.Language> {};
        
        for (let i = 0; i < divs.length; i++) {
            switch (i) {
                case CommandDivElement.Name:
                    name = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
                case CommandDivElement.Trigger:
                    trigger = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
                case CommandDivElement.Code:
                    code = (divs[i].getElementsByClassName('uk-textarea')[0] as HTMLInputElement).defaultValue;
                    break;
                case CommandDivElement.Language:
                    const selector = divs[i].getElementsByClassName('uk-select')[0] as HTMLSelectElement;
    
                    for (const option of selector) {
                        if (option.selected) {
                            language.id = <LanguageId> option.value;
                            language.name = <LanguageName> option.textContent!;
                        }
                    }
                    break;
            }
        }
    
        return { name, trigger, code, language } satisfies OmitId<Data.Command.Base>;
    }

    /**
     * 
     * Create a new command
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param data The data with which the command will be created
     */
    public static async create(authToken: string, botId: string, data: Partial<Data.Command.Partial>): Promise<Data.Command.Base> {
        const document = await makeRequest({
            type: Create.Command,
            botId
        }, authToken);

        if (document.error) throw document.error;

        const commandId = document.response
            .getElementsByTagName('a')[0].href
            .split('/')
            .pop()!;

        const commandData = {
            name: data.name ?? 'Unnamed command',
            trigger: data.trigger ?? '',
            code: data.code ?? '',
            languageName: data.languageName ?? LanguageName.BDS2
        } satisfies Required<Data.Command.Partial>;

        await this.update(authToken, botId, commandId, commandData);

        return {
            id: commandId,
            name: commandData.name,
            trigger: commandData.trigger,
            code: commandData.code,
            language: {
                id: getLanguageIdByName(commandData.languageName),
                name: commandData.languageName
            }
        } satisfies Data.Command.Base;
    }

    /**
     * 
     * Update a command
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param commandId A command id
     * @param data The data which should be updated
     */
    public static async update(authToken: string, botId: string, commandId: string, data: Partial<Data.Command.Partial>): Promise<OmitId<Data.Command.Base>> {
        const oldCommandData = await this.get(authToken, botId, commandId)
            .catch((e: BDFDExternalRequestError) => {
                throw e;
            });

        const request = await makeRequest({
            type: Update.Command,
            botId,
            commandId,
            data: {
                name: data.name ?? oldCommandData.name,
                trigger: data.trigger ?? oldCommandData.trigger,
                code: data.code ?? oldCommandData.code,
                languageName: data.languageName ?? LanguageName.BDS2
            }
        }, authToken);

        if (request.error) throw request.error;

        return oldCommandData;
    }

    /**
     * 
     * Delete a command
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param commandId A command id
     */
    public static async delete(authToken: string, botId: string, commandId: string): Promise<OmitId<Data.Command.Base>> {
        const oldCommandData = await this.get(authToken, botId, commandId)
            .catch((e: BDFDExternalRequestError) => {
                throw e;
            });
        
        const request = await makeRequest({
            type: Delete.Command,
            botId,
            commandId
        }, authToken);

        if (request.error) throw request.error;

        return oldCommandData;
    }

    /**
     * 
     * Get command list
     * 
     * @param authToken An auth token
     * @param botId A bot id
     */
    public static async list(authToken: string, botId: string): Promise<OmitCode<OmitLanguage<Data.Command.Base>>[]> {
        const document = await makeRequest({
            type: Get.CommandVariableList,
            botId
        }, authToken);

        if (document.error) throw document.error;

        const [...children] = document.response.getElementById('bot-switcher')!.children;
        const divList: Element[] = [];

        for (const child of children) {
            if (child.nodeName == 'DIV') {
                divList.push(child);
            }
        }

        const divWithCommands = divList[CommandVariableListDivElement.Command];
        const [...commandCards] = divWithCommands.getElementsByClassName('commandCard');
        const commandList: OmitCode<OmitLanguage<Data.Command.Base>>[] = [];

        for (const card of commandCards) {
            const commandDetails = card.getElementsByClassName('commandDetails');
            const commandControls = card.getElementsByClassName('commandControls');
    
            const id = (commandControls[0].children[0] as HTMLAnchorElement).href
                .split('/')
                .pop()!;
            const name = commandDetails[0].children[0].textContent!;
            const trigger = commandDetails[0].children[1].textContent!;
    
            commandList.push({ id, name, trigger });
        }
    
        return commandList;
    }
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
    public static async get(authToken: string, botId: string, variableId: string): Promise<OmitId<Data.Variable.Base>> {
        const document = await makeRequest({
            type: Get.Variable,
            botId,
            variableId
        }, authToken);
    
        if (document.error) throw document.error;
    
        const divs = document.response.getElementsByClassName('uk-margin');
    
        let name!: string;
        let value!: string;
    
        for (let i = 0; i < divs.length; i++) {
            switch (i) {
                case VariableDivElement.Name:
                    name = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
                case VariableDivElement.Value:
                    value = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
            }
        }
    
        return { name, value } satisfies OmitId<Data.Variable.Base>;
    }

    /**
     * 
     * Create a new variable
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param data The data with which the variable will be created
     */
    public static async create(authToken: string, botId: string, data: Partial<Data.Variable.Partial>): Promise<Data.Variable.Base> {
        const document = await makeRequest({
            type: Create.Variable,
            botId
        }, authToken);

        if (document.error) throw document.error;

        const variableId = document.response
            .getElementsByTagName('a')[0].href
            .split('/')
            .pop()!;

        const variableData = {
            name: data.name ?? 'Unnamed variable',
            value: data.value ?? ''
        } satisfies OmitId<Data.Variable.Base>;

        await this.update(authToken, botId, variableId, variableData);

        return {
            id: variableId,
            ...variableData   
        } satisfies Data.Variable.Base;
    }

    /**
     * 
     * Update a variable
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param variableId A variable id
     * @param data The data which should be updated
     */
    public static async update(authToken: string, botId: string, variableId: string, data: Partial<Data.Variable.Partial>): Promise<OmitId<Data.Variable.Base>> {
        const oldVariableData = await this.get(authToken, botId, variableId)
            .catch((e: BDFDExternalRequestError) => {
                throw e;
            });

        const request = await makeRequest({
            type: Update.Variable,
            botId,
            variableId,
            data: {
                name: data.name ?? oldVariableData.name,
                value: data.value ?? oldVariableData.value
            }
        }, authToken);

        if (request.error) throw request.error;

        return oldVariableData;
    }

    /**
     * 
     * Delete a variable
     * 
     * @param authToken An auth token
     * @param botId A bot id
     * @param variableId A variable id
     */
    public static async delete(authToken: string, botId: string, variableId: string): Promise<OmitId<Data.Variable.Base>> {
        const oldVariableData = await this.get(authToken, botId, variableId)
            .catch((e: BDFDExternalRequestError) => {
                throw e;
            });
        
        const request = await makeRequest({
            type: Delete.Variable,
            botId,
            variableId
        }, authToken);

        if (request.error) throw request.error;

        return oldVariableData;
    }

    /**
     * 
     * Get variable list
     * 
     * @param authToken An auth token
     * @param botId A bot id
     */
    public static async list(authToken: string, botId: string): Promise<Data.Variable.Base[]> {
        const document = await makeRequest({
            type: Get.CommandVariableList,
            botId
        }, authToken);

        if (document.error) throw document.error;

        const [...children] = document.response.getElementById('bot-switcher')!.children;
        const divList: Element[] = [];

        for (const child of children) {
            if (child.nodeName == 'DIV') {
                divList.push(child);
            }
        }

        const divWithVariables = divList[CommandVariableListDivElement.Variable];
        const [...variableCards] = divWithVariables.getElementsByClassName('commandCard');
        const variableList: Data.Variable.Base[] = [];

        for (const card of variableCards) {
            const variableDetails = card.getElementsByClassName('commandDetails');
            const variableControls = card.getElementsByClassName('commandControls');
    
            const id = (variableControls[0].children[0] as HTMLAnchorElement).href
                .split('/')
                .pop()!;
            const name = variableDetails[0].children[0].textContent!;
            const value = variableDetails[0].children[1].textContent!;
    
            variableList.push({ id, name, value });
        }
    
        return variableList;
    }
}
