import * as centra from "centra";
import { JSDOM } from "jsdom";

import {
    BOT_PATH,
    CASE,
    COMMAND_PATH,
    ERROR,
    HOME_PATH,
    MAX_REQUEST_ATTEMPTS,
    NEW_COMMAND_PATH,
    NEW_VARIABLE_PATH,
    REQUEST_STATUS,
    START_TIMEOUT,
    RE_REQUEST_INTERVAL,
    START_ATTEMPT,
    VARIABLE_PATH,
    REQUEST_FAILED,
    FORM
} from "./consts";

import {
    RequestCreate,
    RequestDelete,
    RequestGet,
    RequestUpdate,
    RequestMethod,
    LanguageName,
    LanguageId
} from "./enums";

import type { Request } from "../types/types";

type RequestType = RequestCreate | RequestDelete | RequestGet | RequestUpdate;

async function request(requestType: RequestType, requestData: Request.Data.Request): Promise<Request.Response.Request> {
    const authToken = `default-sessionStore=${requestData.authToken}`;

    let centraRequest!: centra.Request;

    switch (requestType) {
        case RequestGet.User:
            centraRequest = centra(HOME_PATH);
            break;
        case RequestGet.BotList:
            centraRequest = centra(HOME_PATH);
            break;
        case RequestGet.CVL:
            centraRequest = centra( BOT_PATH.GENERATE(requestData.botID!) );
            break;
        case RequestGet.Command:
            centraRequest = centra( COMMAND_PATH(requestData.botID!, requestData.commandData!.commandID!) );
            break;
        case RequestGet.Variable:
            centraRequest = centra( VARIABLE_PATH(requestData.botID!, requestData.variableData!.variableID!) );
            break;
        case RequestUpdate.Command:
            centraRequest = centra(
                COMMAND_PATH(requestData.botID!, requestData.commandData!.commandID!),
                RequestMethod.Post
            ).body({
                name: requestData.commandData!.commandName!,
                command: requestData.commandData!.commandTrigger!,
                replyMessage: requestData.commandData!.commandCode!,
                language: requestData.commandData!.commandLanguage!.id!
            }, FORM);
            break;
        case RequestUpdate.Variable:
            centraRequest = centra(
                VARIABLE_PATH(requestData.botID!, requestData.variableData!.variableID!),
                RequestMethod.Post
            ).body({
                name: requestData.variableData!.variableName!,
                value: requestData.variableData!.variableValue!
            }, FORM);
            break;
        case RequestCreate.Command:
            centraRequest = centra( NEW_COMMAND_PATH(requestData.botID!) );
            break;
        case RequestCreate.Variable:
            centraRequest = centra( NEW_VARIABLE_PATH(requestData.botID!) );
            break;
        case RequestDelete.Command:
            centraRequest = centra(
                COMMAND_PATH(requestData.botID!, requestData.commandData!.commandID!),
                RequestMethod.Delete
            );
            break;
        case RequestDelete.Variable:
            centraRequest = centra(
                VARIABLE_PATH(requestData.botID!, requestData.variableData!.variableID!),
                RequestMethod.Delete
            );
            break;
    }

    const centraResponse = await new Promise<centra.Response>((resolve, reject) => {
        const request = (
            centraRequest
            .header('cookie', authToken)
            .timeout(START_TIMEOUT)
        );
        
        let attempt = START_ATTEMPT;
        let timeout = START_TIMEOUT;

        function sendRequest() {
            request
            .send()
            .then((res) => resolve(res))
            .catch((err) => {
                attempt++;
                timeout += 1000;

                if (attempt === MAX_REQUEST_ATTEMPTS) {
                    console.error(REQUEST_FAILED.NO_RETRY, err);

                    reject( ERROR.UNKNOWN(1) );
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
    const status = centraResponse.statusCode!;

    return {
        error: checkForError(status),
        response: new JSDOM(response).window.document
    };
}

function checkForError(statusCode: number) {
    switch (statusCode) {
        case REQUEST_STATUS.SUCCESS:
            return false;
        case REQUEST_STATUS.SEE_OTHER:
            return false;
        case REQUEST_STATUS.FOUND:
            return ERROR.AUTH_TOKEN(statusCode);
        case REQUEST_STATUS.BAD_REQUEST:
            return ERROR.MISSING(statusCode);
        case REQUEST_STATUS.FORBIDDEN:
            return ERROR.LIMIT(statusCode);
        case REQUEST_STATUS.NOT_FOUND:
            return ERROR.GENERAL(statusCode);
        default:
            return ERROR.UNKNOWN(statusCode);
    }
}

function languageSwitcher(name: LanguageName) {
    switch (name) {
        case LanguageName.BDS:
            return LanguageId.BDS;
        case LanguageName.JS:
            return LanguageId.JS;
        case LanguageName.BDSU:
            return LanguageId.BDSU;
        case LanguageName.BDS2:
            return LanguageId.BDS2;
        default:
            return LanguageId.BDS2;
    }
}

export class User {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An authorized user's username
     */
    static async get(baseData: Omit<Request.Data.Base, 'botID'>): Promise<string> {
        const document = await request(RequestGet.User, {
            authToken: baseData.authToken
        });

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
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a bot's info
     */
    static async list(baseData: Omit<Request.Data.Base, 'botID'>): Promise<Request.Response.Bots[]> {
        const document = await request(RequestGet.BotList, {
            authToken: baseData.authToken
        });
    
        if (document.error) throw document.error;
    
        const botCards = document.response.getElementsByClassName('botCard');
    
        let botList: Request.Response.Bots[] = [];
    
        for (const botCard of botCards) {
            const texts = botCard.getElementsByTagName('p')[0].textContent!.replace(/\t/g, '').split('\n');
            
            const botID = (botCard as HTMLAnchorElement).href.split('/').pop() ?? '';
            const botName = botCard.getElementsByClassName('uk-card-title')[0].textContent ?? '';
    
            let hostingTime = texts[2];
            let commandCount = '';
            let variableCount = '';
    
            if (hostingTime == 'Hosting already ended') {
                commandCount = texts[5].trim();
                variableCount = texts[6].trim();
            } else {
                const innerHTML = botCard.getElementsByTagName('p')[0].innerHTML;
                const rawHostingTimeDate = innerHTML.split('"date: ')[1].split('">')[0];
    
                hostingTime = rawHostingTimeDate;
                commandCount = texts[10].trim();
                variableCount = texts[11].trim();
            }
    
            botList.push({ botID, botName, hostingTime, commandCount, variableCount });
        }
    
        return botList;
    }
}

export class Command {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandData An object containing new command's data
     * @returns An object containing created command's data
     */
    static async create(baseData: Request.Data.Base, commandData: Partial<Omit<Request.Data.Command.Data, 'commandID'>>): Promise<Request.Data.Command.Data> {
        const document = await request(RequestCreate.Command, {
            authToken: baseData.authToken,
            botID: baseData.botID
        });

        if (document.error) throw document.error;

        const languageNameRegExp = new RegExp(/^(?:BDScript ?(?:2|Unstable)?|Javascript \(ES5\+BD\.js\))$/gm);

        const commandID = document.response.getElementsByTagName('a')[0].href.split('/').pop()!;
        const commandName = commandData.commandName ?? 'Unnamed command';
        const commandTrigger = commandData.commandTrigger ?? '';
        const commandCode = commandData.commandCode ?? '';
        const commandLanguage =
        commandData.commandLanguage ?
        commandData.commandLanguage.id ? { id: commandData.commandLanguage.id } :
        commandData.commandLanguage.name ?
        languageNameRegExp.test(commandData.commandLanguage.name) ? { name: commandData.commandLanguage.name } :
        { id: '3' } : { id: '3' } : { id: '3' };

        const newCommandData: Request.Data.Command.Data = { commandID, commandName, commandTrigger, commandCode, commandLanguage };

        await this.update({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, { commandName, commandTrigger, commandLanguage, commandCode }, commandID);

        return newCommandData;
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandID A BDFD Command ID
     * @returns An object containing deleted command's data
     */
    static async delete(baseData: Request.Data.Base, commandID: string): Promise<Request.Response.Command> {
        const deleted = await this.get({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, commandID).catch((e: Request.Error) => e);

        if (( <Request.Error> deleted ).status) throw deleted;
    
        const req = await request(RequestDelete.Command, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            commandData: { commandID }
        });
    
        if (req.error) throw req.error;
    
        return <Request.Response.Command> deleted;
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandID A BDFD Command ID
     * @returns An object containing command's data
     */
    static async get(baseData: Request.Data.Base, commandID: string): Promise<Request.Response.Command> {
        const document = await request(RequestGet.Command, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            commandData: { commandID }
        });
    
        if (document.error) throw document.error;
    
        const divs = document.response.getElementsByClassName('uk-margin')
    
        let commandName = '';
        let commandTrigger = '';
        let commandLanguage: Request.Data.Command.LanguageData = {};
        let commandCode = '';
    
        for (let i = 0; i < divs.length; i++) {
            switch (i) {
                case CASE.COMMAND.NAME:
                    commandName = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
                case CASE.COMMAND.TRIGGER:
                    commandTrigger = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
                case CASE.COMMAND.CODE:
                    commandCode = (divs[i].getElementsByClassName('uk-textarea')[0] as HTMLInputElement).defaultValue;
                    break;
                case CASE.COMMAND.LANGUAGE:
                    const selector = divs[i].getElementsByClassName('uk-select')[0] as HTMLSelectElement;
    
                    for (const option of selector) {
                        if (option.selected) {
                            commandLanguage = {
                                id: option.value,
                                name: option.textContent!
                            };
                        }
                    }
                    break;
            }
        }
    
        return <Request.Response.Command> { commandName, commandTrigger, commandLanguage, commandCode };
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a command's info
     */
    static async list(baseData: Request.Data.Base): Promise<Request.Response.Commands[]> {
        const document = await request(RequestGet.CVL, {
            authToken: baseData.authToken,
            botID: baseData.botID
        });
    
        if (document.error) throw document.error;
    
        const [...children] = document.response.getElementById('bot-switcher')!.children;
    
        let divs = [];
    
        for (const child of children) {
            if (child.nodeName == 'DIV') {
                divs.push(child);
            }
        }
    
        const divWithCommands = divs[1];
    
        const [...commandCards] = divWithCommands.getElementsByClassName('commandCard');
    
        let commandList: Request.Response.Commands[] = [];
    
        for (const card of commandCards) {
            const commandDetails = card.getElementsByClassName('commandDetails');
            const commandControls = card.getElementsByClassName('commandControls');
    
            const commandName = commandDetails[0].children[0].textContent ?? '';
            const commandTrigger = commandDetails[0].children[1].textContent ?? '';
            const commandID = (commandControls[0].children[0] as HTMLAnchorElement).href.split('/').pop() ?? '';
    
            commandList.push({ commandID, commandName, commandTrigger });
        }
    
        return commandList;
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandData An object containing old command's data (with the exception of the `commandID` property)
     * @param commandID A BDFD Command ID
     * @returns An object containing previous command's data
     */
    static async update(baseData: Request.Data.Base, commandData: Partial<Omit<Request.Data.Command.Data, 'commandID'>>, commandID: string): Promise<Request.Response.Command> {
        const previous = await this.get({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, commandID).catch((e: Request.Error) => e);

        if (( <Request.Error> previous ).status) throw previous;
    
        const req = await request(RequestUpdate.Command, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            commandData: {
                commandID,
                commandName: commandData.commandName ?? ( <Request.Response.Command> previous ).commandName,
                commandTrigger: commandData.commandTrigger ?? ( <Request.Response.Command> previous ).commandTrigger,
                commandCode: commandData.commandCode ?? ( <Request.Response.Command> previous ).commandCode,
                commandLanguage: {
                    id: commandData.commandLanguage?.id ? commandData.commandLanguage.id : commandData.commandLanguage?.name ? languageSwitcher( <LanguageName> commandData.commandLanguage.name) : ( <Request.Response.Command> previous ).commandLanguage!.id
                }
            }
        });
    
        if (req.error) throw req.error;
    
        return <Request.Response.Command> previous;
    }
}

export class Variable {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableData An object containing new variable's data (with the exception of the `variableID` property)
     * @returns An object containing created variable's data
     */
    static async create(baseData: Request.Data.Base, variableData: Partial<Omit<Request.Data.Variable.Data, 'variableID'>>): Promise<Request.Data.Variable.Data> {
        const document = await request(RequestCreate.Variable, {
            authToken: baseData.authToken,
            botID: baseData.botID
        });

        if (document.error) throw document.error;

        const variableID = document.response.getElementsByTagName('a')[0].href.split('/').pop()!;
        const variableName = variableData.variableName ?? 'Unnamed variable';
        const variableValue = variableData.variableValue ?? '';

        const newVariableData: Request.Data.Variable.Data = { variableID, variableName, variableValue };

        await this.update({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, { variableName, variableValue }, variableID);

        return newVariableData;
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableID A BDFD Variable ID
     * @returns An object containing deleted variable's data
     */
    static async delete(baseData: Request.Data.Base, variableID: string): Promise<Request.Response.Variable> {
        const deleted = await this.get({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, variableID).catch((e: Request.Error) => e);

        if (( <Request.Error> deleted ).status) throw deleted;
    
        const req = await request(RequestDelete.Variable, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            variableData: { variableID }
        });
    
        if (req.error) throw req.error;
    
        return <Request.Response.Variable> deleted;
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableID A BDFD Variable ID
     * @returns An object containing variable's data
     */
    static async get(baseData: Request.Data.Base, variableID: string): Promise<Request.Response.Variable> {
        const document = await request(RequestGet.Variable, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            variableData: { variableID }
        });
    
        if (document.error) throw document.error;
    
        const divs = document.response.getElementsByClassName('uk-margin');
    
        let variableName = '';
        let variableValue = '';
    
        for (let i = 0; i < divs.length; i++) {
            switch (i) {
                case CASE.VARIABLE.NAME:
                    variableName = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
                case CASE.VARIABLE.VALUE:
                    variableValue = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
            }
        }
    
        return <Request.Response.Variable> { variableName, variableValue };
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a variable's info
     */
    static async list(baseData: Request.Data.Base): Promise<Request.Response.Variables[]> {
        const document = await request(RequestGet.CVL, {
            authToken: baseData.authToken,
            botID: baseData.botID
        });
    
        if (document.error) throw document.error;
    
        const [...children] = document.response.getElementById('bot-switcher')!.children;
    
        let divs = [];
    
        for (const child of children) {
            if (child.nodeName == 'DIV') {
                divs.push(child);
            }
        }
    
        const divWithVariables = divs[2];

        const [...variableCards] = divWithVariables.getElementsByClassName('commandCard');
        
        let variableList: Request.Response.Variables[] = [];
    
        for (const card of variableCards) {
            const commandDetails = card.getElementsByClassName('commandDetails');
            const commandControls = card.getElementsByClassName('commandControls');
    
            const variableName = commandDetails[0].children[0].textContent ?? '';
            const variableValue = commandDetails[0].children[1].textContent ? (commandDetails[0].children[1].textContent.split('=').pop() ?? '') : '';
            const variableID = (commandControls[0].children[0] as HTMLAnchorElement).href.split('/').pop() ?? '';
    
            variableList.push({ variableID, variableName, variableValue });
        }
    
        return variableList;
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableData An object containing old variable's data (with the exception of the `variableID` property)
     * @param variableID A BDFD Variable ID
     * @returns An object containing previous variable's data
     */
    static async update(baseData: Request.Data.Base, variableData: Partial<Omit<Request.Data.Variable.Data, 'variableID'>>, variableID: string): Promise<Request.Response.Variable> {
        const previous = await this.get({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, variableID).catch((e: Request.Error) => e);

        if (( <Request.Error> previous ).status) throw previous;
    
        const req = await request(RequestUpdate.Variable, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            variableData: {
                variableID,
                variableName: variableData.variableName ?? ( <Request.Response.Variable> previous ).variableName,
                variableValue: variableData.variableValue ?? ( <Request.Response.Variable> previous ).variableValue
            }
        });
    
        if (req.error) throw req.error;
    
        return <Request.Response.Variable> previous;
    }
}
