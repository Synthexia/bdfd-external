import * as centra from "centra";
import { JSDOM } from "jsdom";
import {
    BOT_PATH,
    CASE,
    COMMAND_PATH,
    ERROR,
    HOME_PATH,
    LANGUAGE_ID,
    LANGUAGE_NAME,
    MAX_REQUEST_ATTEMPTS,
    NEW_COMMAND_PATH,
    NEW_VARIABLE_PATH,
    REQUEST_CREATE,
    REQUEST_DELETE,
    REQUEST_GET,
    REQUEST_STATUS,
    START_TIMEOUT,
    REQUEST_UPDATE,
    RE_REQUEST_INTERVAL,
    START_ATTEMPT,
    VARIABLE_PATH,
    REQUEST_FAILED,
    REQUEST_METHOD,
    FORM
} from "./consts";
import type {
    Request
} from "../types/types";

type RequestType = REQUEST_CREATE | REQUEST_DELETE | REQUEST_GET | REQUEST_UPDATE;

async function request(requestType: RequestType, requestData: Request.Data.Request): Promise<Request.Response.Request> {
    const authToken = `default-sessionStore=${requestData.authToken}`;

    let centraRequest!: centra.Request;

    switch (requestType) {
        case REQUEST_GET.BOT_LIST:
            centraRequest = centra(HOME_PATH);
            break;
        case REQUEST_GET.CVL:
            centraRequest = centra( BOT_PATH.GENERATE(requestData.botID!) );
            break;
        case REQUEST_GET.COMMAND:
            centraRequest = centra( COMMAND_PATH(requestData.botID!, requestData.commandData!.commandID!) );
            break;
        case REQUEST_GET.VARIABLE:
            centraRequest = centra( VARIABLE_PATH(requestData.botID!, requestData.variableData!.variableID!) );
            break;
        case REQUEST_UPDATE.COMMAND:
            centraRequest = centra(
                COMMAND_PATH(requestData.botID!, requestData.commandData!.commandID!),
                REQUEST_METHOD.POST
            ).body({
                name: requestData.commandData!.commandName!,
                command: requestData.commandData!.commandTrigger!,
                replyMessage: requestData.commandData!.commandCode!,
                language: requestData.commandData!.commandLanguage!.id!
            }, FORM);
            break;
        case REQUEST_UPDATE.VARIABLE:
            centraRequest = centra(
                VARIABLE_PATH(requestData.botID!, requestData.variableData!.variableID!),
                REQUEST_METHOD.POST
            ).body({
                name: requestData.variableData!.variableName!,
                value: requestData.variableData!.variableValue!
            }, FORM);
            break;
        case REQUEST_CREATE.COMMAND:
            centraRequest = centra( NEW_COMMAND_PATH(requestData.botID!) );
            break;
        case REQUEST_CREATE.VARIABLE:
            centraRequest = centra( NEW_VARIABLE_PATH(requestData.botID!) );
            break;
        case REQUEST_DELETE.COMMAND:
            centraRequest = centra(
                COMMAND_PATH(requestData.botID!, requestData.commandData!.commandID!),
                REQUEST_METHOD.DELETE
            );
            break;
        case REQUEST_DELETE.VARIABLE:
            centraRequest = centra(
                VARIABLE_PATH(requestData.botID!, requestData.variableData!.variableID!),
                REQUEST_METHOD.DELETE
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

function languageSwitcher(name: LANGUAGE_NAME) {
    switch (name) {
        case LANGUAGE_NAME.BDS:
            return LANGUAGE_ID.BDS;
        case LANGUAGE_NAME.JS:
            return LANGUAGE_ID.JS;
        case LANGUAGE_NAME.BDSU:
            return LANGUAGE_ID.BDSU;
        case LANGUAGE_NAME.BDS2:
            return LANGUAGE_ID.BDS2;
        default:
            return LANGUAGE_ID.BDS2;
    }
}

export class Bot {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a bot's info
     */
    static async list(baseData: Omit<Request.Data.Base, 'botID'>): Promise<Request.Response.Bots[]> {
        const document = await request(REQUEST_GET.BOT_LIST, {
            authToken: baseData.authToken
        });
    
        if (document.error) throw document.error;
    
        const botCards = document.response.getElementsByClassName('botCard');
    
        let botList: Request.Response.Bots[] = [];
    
        for (const botCard of botCards) {
            const texts = botCard.getElementsByTagName('p')[0].textContent!
                .replace(/\t/g, '')
                .split('\n')
            ;
            
            const
                botID = (botCard as HTMLAnchorElement).href.split('/').pop() ?? '',
                botName = botCard.getElementsByClassName('uk-card-title')[0].textContent ?? ''
            ;
    
            let
                hostingTime = texts[2],
                commandsText = '',
                variablesText = ''
            ;
    
            if (hostingTime == 'Hosting already ended') {
                commandsText = texts[5].trim();
                variablesText = texts[6].trim();
            } else {
                const innerHTML = botCard.getElementsByTagName('p')[0].innerHTML;
                const rawHostingTimeDate = innerHTML.split('"date: ')[1].split('">')[0];
    
                hostingTime = rawHostingTimeDate;
                commandsText = texts[10].trim();
                variablesText = texts[11].trim();
            }
    
            botList.push({
                botID,
                botName,
                hostingTime,
                commandCount: commandsText,
                variableCount: variablesText
            });
        }
    
        return botList;
    }
}

export class Command {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandData An object containing new command's data (with the exception of the `commandID` property)
     * @returns An object containing created command's data
     */
    static async create(baseData: Request.Data.Base, commandData: Omit<Request.Data.Command.Data, 'commandID'>): Promise<Request.Data.Command.Data> {
        const document = await request(REQUEST_CREATE.COMMAND, {
            authToken: baseData.authToken,
            botID: baseData.botID
        });

        if (document.error) throw document.error;

        const languageNameRegExp = new RegExp(/^(?:BDScript ?(?:2|Unstable)?|Javascript \(ES5\+BD\.js\))$/gm);
        const
            commandID = document.response.getElementsByTagName('a')[0].href.split('/').pop()!,
            commandName = commandData.commandName ?? 'Unnamed command',
            commandTrigger = commandData.commandTrigger ?? '',
            commandCode = commandData.commandCode ?? '',
            commandLanguage =
                commandData.commandLanguage ?
                commandData.commandLanguage.id ? { id: commandData.commandLanguage.id } :
                commandData.commandLanguage.name ?
                languageNameRegExp.test(commandData.commandLanguage.name) ? { name: commandData.commandLanguage.name } :
                { id: '3' } : { id: '3' } : { id: '3' }
        ;
        const handledCommandData: Request.Data.Command.Data = {
            commandID,
            commandName,
            commandTrigger,
            commandCode,
            commandLanguage
        };

        await this.update({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, handledCommandData);

        return handledCommandData;
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
    
        const req = await request(REQUEST_DELETE.COMMAND, {
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
        const document = await request(REQUEST_GET.COMMAND, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            commandData: { commandID }
        });
    
        if (document.error) throw document.error;
    
        const divs = document.response.getElementsByClassName('uk-margin')
    
        let
            commandName = '',
            commandTrigger = '',
            commandLanguage: Request.Data.Command.LanguageData = {},
            commandCode = ''
        ;
    
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
    
        return <Request.Response.Command> {
            commandName,
            commandTrigger,
            commandLanguage,
            commandCode
        };
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a command's info
     */
    static async list(baseData: Request.Data.Base): Promise<Request.Response.Commands[]> {
        const document = await request(REQUEST_GET.CVL, {
            authToken: baseData.authToken,
            botID: baseData.botID
        });
    
        if (document.error) throw document.error;
    
        const children = document.response.getElementById('bot-switcher')!.children;
    
        const childrenArray = Array.from(children);
        let divs = [];
    
        for (const child of childrenArray) {
            if (child.nodeName == 'DIV') {
                divs.push(child);
            }
        }
    
        const divWithCommands = divs[1];
    
        const commandCards = Array.from(divWithCommands.getElementsByClassName('commandCard'));
    
        let commandList: Request.Response.Commands[] = [];
    
        for (const card of commandCards) {
            const
                commandDetails = card.getElementsByClassName('commandDetails'),
                commandControls = card.getElementsByClassName('commandControls')
            ;
    
            const
                commandName = commandDetails[0].children[0].textContent ?? '',
                commandTrigger = commandDetails[0].children[1].textContent ?? '',
                commandID = (commandControls[0].children[0] as HTMLAnchorElement).href.split('/').pop() ?? ''
            ;
    
            commandList.push({
                commandID,
                commandName,
                commandTrigger
            });
        }
    
        return commandList;
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param commandData An object containing new command's data (with the exception of the `commandID` property)
     * @returns An object containing previous command's data
     */
    static async update(baseData: Request.Data.Base, commandData: Request.Data.Command.Data): Promise<Request.Response.Command> {
        const commandID = commandData?.commandID ? commandData.commandID : '';

        const previous = await this.get({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, commandID).catch((e: Request.Error) => e);

        if (( <Request.Error> previous ).status) throw previous;
    
        const req = await request(REQUEST_UPDATE.COMMAND, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            commandData: {
                commandID,
                commandName: commandData.commandName ?? ( <Request.Response.Command> previous ).commandName,
                commandTrigger: commandData.commandTrigger ?? ( <Request.Response.Command> previous ).commandTrigger,
                commandCode: commandData.commandCode ?? ( <Request.Response.Command> previous ).commandCode,
                commandLanguage: {
                    id: commandData.commandLanguage?.id ? commandData.commandLanguage.id : commandData.commandLanguage?.name ? languageSwitcher( <LANGUAGE_NAME> commandData.commandLanguage.name) : ( <Request.Response.Command> previous ).commandLanguage!.id
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
    static async create(baseData: Request.Data.Base, variableData: Omit<Request.Data.Variable.Data, 'variableID'>): Promise<Request.Data.Variable.Data> {
        const document = await request(REQUEST_CREATE.VARIABLE, {
            authToken: baseData.authToken,
            botID: baseData.botID
        });

        if (document.error) throw document.error;

        const
            variableID = document.response.getElementsByTagName('a')[0].href.split('/').pop()!,
            variableName = variableData.variableName ?? 'Unnamed variable',
            variableValue = variableData.variableValue ?? ''
        ;
        const handledVariableData: Request.Data.Variable.Data = {
            variableID,
            variableName,
            variableValue
        };

        await this.update({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, handledVariableData);

        return handledVariableData;
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
    
        const req = await request(REQUEST_DELETE.VARIABLE, {
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
        const document = await request(REQUEST_GET.VARIABLE, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            variableData: { variableID }
        });
    
        if (document.error) throw document.error;
    
        const divs = document.response.getElementsByClassName('uk-margin');
    
        let
            variableName = '',
            variableValue = ''
        ;
    
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
    
        return <Request.Response.Variable> {
            variableName,
            variableValue
        };
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a variable's info
     */
    static async list(baseData: Request.Data.Base): Promise<Request.Response.Variables[]> {
        const document = await request(REQUEST_GET.CVL, {
            authToken: baseData.authToken,
            botID: baseData.botID
        });
    
        if (document.error) throw document.error;
    
        const children = document.response.getElementById('bot-switcher')!.children;
    
        const childrenArray = Array.from(children);
        let divs = [];
    
        for (const child of childrenArray) {
            if (child.nodeName == 'DIV') {
                divs.push(child);
            }
        }
    
        const divWithVariables = divs[2];
    
        const variableCards = Array.from(divWithVariables.getElementsByClassName('commandCard'));
    
        let variableList: Request.Response.Variables[] = [];
    
        for (const card of variableCards) {
            const
                commandDetails = card.getElementsByClassName('commandDetails'),
                commandControls = card.getElementsByClassName('commandControls')
            ;
    
            const
                variableName = commandDetails[0].children[0].textContent ?? '',
                variableValue = commandDetails[0].children[1].textContent ? (commandDetails[0].children[1].textContent.split('=').pop() ?? '') : '',
                variableID = (commandControls[0].children[0] as HTMLAnchorElement).href.split('/').pop() ?? ''
            ;
    
            variableList.push({
                variableID,
                variableName,
                variableValue
            });
        }
    
        return variableList;
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableData An object containing new variable's data (with the exception of the `variableID` property)
     * @returns An object containing previous variable's data
     */
    static async update(baseData: Request.Data.Base, variableData: Request.Data.Variable.Data): Promise<Request.Response.Variable> {
        const variableID = variableData?.variableID ? variableData.variableID : '';

        const previous = await this.get({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, variableID).catch((e: Request.Error) => e);

        if (( <Request.Error> previous ).status) throw previous;
    
        const req = await request(REQUEST_UPDATE.VARIABLE, {
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
