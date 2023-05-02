import * as centra from "centra";
import { JSDOM } from "jsdom";
import {
    BOT_PATH,
    CASE,
    COMMAND_PATH,
    ERROR,
    HOME_PATH,
    REQUEST_STATUS,
    REQUEST_TYPE,
    VARIABLE_PATH
} from "./consts";
import type {
    RequestType,
    RequestData,
    RequestError,
    BaseData,
    VariableResponse,
    VariablesResponse,
    CommandsResponse,
    CommandResponse,
    RequestFunction,
    CommandData,
    UpdateCommand,
    VariableData,
    UpdateVariable,
    CommandList,
    VariableList,
    GetCommand,
    GetVariable,
    BotList
} from "../types/types";

async function request(requestType: RequestType, requestData: RequestData): RequestFunction {
    const authToken = `default-sessionStore=${requestData.authToken}`;

    let
        centraResponse!: centra.Response,
        response: string,
        status: number
    ;

    switch (requestType) {
        case REQUEST_TYPE.GetBots:
            centraResponse = await centra(HOME_PATH)
                .header('cookie', authToken)
                .send()
            ;
            break;
        case REQUEST_TYPE.GetCommandsAndVariables:
            centraResponse = await centra(BOT_PATH.Dynamic(requestData.botID!))
                .header('cookie', authToken)
                .send()
            ;
            break;
        case REQUEST_TYPE.GetCommand:
            centraResponse = await centra(COMMAND_PATH(requestData.botID!, requestData.commandData!.commandID))
                .header('cookie', authToken)
                .send()
            ;
            break;
        case REQUEST_TYPE.GetVariable:
            centraResponse = await centra(VARIABLE_PATH(requestData.botID!, requestData.variableData!.variableID))
                .header('cookie', authToken)
                .send()
            ;
            break;
        case REQUEST_TYPE.UpdateCommand:
            centraResponse = await centra(COMMAND_PATH(requestData.botID!, requestData.commandData!.commandID), 'POST')
                .header('cookie', authToken)
                .body({
                    name: requestData.commandData!.commandName!,
                    command: requestData.commandData!.commandTrigger!,
                    replyMessage: requestData.commandData!.commandCode!,
                    language: requestData.commandData!.commandLanguage!.id!
                }, 'form')
                .send()
            ;
            break;
        case REQUEST_TYPE.UpdateVariable:
            centraResponse = await centra(VARIABLE_PATH(requestData.botID!, requestData.variableData!.variableID), 'POST')
                .header('cookie', authToken)
                .body({
                    name: requestData.variableData!.variableName!,
                    value: requestData.variableData!.variableValue!
                }, 'form')
                .send()
            ;
            break;
        // TODO
        /*
        case REQUEST_TYPE.CreateCommand:
            break;
        case REQUEST_TYPE.CreateVariable:
            break;
        case REQUEST_TYPE.DeleteCommand:
            break;
        case REQUEST_TYPE.DeleteVariable:
            break;
        */
    }

    response = await centraResponse.text();
    status = centraResponse.statusCode!;

    return {
        error: checkForError(status),
        response: new JSDOM(response).window.document
    };
}

function checkForError(statusCode: number) {
    let error: boolean | RequestError = ERROR.Unknown(statusCode);

    switch (statusCode) {
        case REQUEST_STATUS.Success:
            error = false;
            break;
        case REQUEST_STATUS.Found:
            error = ERROR.AuthToken(statusCode);
            break;
        case REQUEST_STATUS.BadRequest:
            error = ERROR.Missing(statusCode);
            break;
        case REQUEST_STATUS.NotFound:
            error = ERROR.General(statusCode);
            break;
    }
    
    return error;
}

function languageSwitcher(name: string) {
    let id = '3';

    switch (name) {
        case 'BDScript':
            id = '0';
            break;
        case 'Javascript (ES5+BD.js)':
            id = '1';
            break;
        case 'BDScript Unstable':
            id = '2';
            break;
        case 'BDScript 2':
            id = '3';
            break;
    }

    return id;
}

export class Bot {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a bot's info
     */
    static async list(baseData: BaseData): BotList {
        const document = await request(REQUEST_TYPE.GetBots, {
            authToken: baseData.authToken
        });
    
        if (document.error) return <RequestError> document.error;
    
        const botCards = document.response.getElementsByClassName('botCard');
    
        let botList = [];
    
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
                botID: botID,
                botName: botName,
                hostingTime: hostingTime,
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
     * @param commandID A BDFD Command ID
     * @returns An object containing command's data
     */
    static async get(baseData: BaseData, commandID: string): GetCommand {
        const document = await request(REQUEST_TYPE.GetCommand, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            commandData: {
                commandID: commandID
            }
        });
    
        if (document.error) return <RequestError> document.error;
    
        const divs = document.response.getElementsByClassName('uk-margin')
    
        let
            commandName = '',
            commandTrigger = '',
            commandLanguage = '',
            commandLanguageID = '',
            commandCode = ''
        ;
    
        for (let i = 0; i < divs.length; i++) {
            switch (i) {
                case CASE.Command.Name:
                    commandName = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
                case CASE.Command.Trigger:
                    commandTrigger = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
                case CASE.Command.Code:
                    commandCode = (divs[i].getElementsByClassName('uk-textarea')[0] as HTMLInputElement).defaultValue;
                    break;
                case CASE.Command.Language:
                    const selector = divs[i].getElementsByClassName('uk-select')[0] as HTMLSelectElement;
    
                    for (const option of selector) {
                        if (option.selected) {
                            commandLanguage = option.textContent!;
                            commandLanguageID = option.value;
                        }
                    }
                    break;
            }
        }
    
        return <CommandResponse> {
            commandName: commandName,
            commandTrigger: commandTrigger,
            commandLanguage: commandLanguage,
            commandLanguageID: commandLanguageID,
            commandCode: commandCode
        };
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a command's info
     */
    static async list(baseData: BaseData): CommandList {
        const document = await request(REQUEST_TYPE.GetCommandsAndVariables, {
            authToken: baseData.authToken,
            botID: baseData.botID
        });
    
        if (document.error) return <RequestError> document.error;
    
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
    
        let commandList = [];
    
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
    
            commandList.push( <CommandsResponse> {
                commandID: commandID,
                commandName: commandName,
                commandTrigger: commandTrigger
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
    static async update(baseData: BaseData, commandData: CommandData): UpdateCommand {
        const commandID = commandData?.commandID ? commandData.commandID : '';

        const previous = await this.get({
            authToken: baseData.authToken,
            botID: baseData.botID
        }, commandID);

        if (( <RequestError> previous ).status) return previous;
    
        const req = await request(REQUEST_TYPE.UpdateCommand, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            commandData: {
                commandID: commandID,
                commandName: commandData.commandName ?? ( <CommandResponse> previous ).commandName,
                commandTrigger: commandData.commandTrigger ?? ( <CommandResponse> previous ).commandTrigger,
                commandCode: commandData.commandCode ?? ( <CommandResponse> previous ).commandCode,
                commandLanguage: {
                    id: commandData.commandLanguage?.id ? commandData.commandLanguage.id : commandData.commandLanguage?.name ? languageSwitcher(commandData.commandLanguage.name) : ( <CommandResponse> previous ).commandLanguageID
                }
            }
        });
    
        if (req.error) return <RequestError> req.error;
    
        return previous;
    }
}

export class Variable {
    /**
     * 
     * @param baseData An object containing data for authorization
     * @param variableID A BDFD Variable ID
     * @returns An object containing variable's data
     */
    static async get(baseData: BaseData, variableID: string): GetVariable {
        const document = await request(REQUEST_TYPE.GetVariable, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            variableData: {
                variableID: variableID
            }
        });
    
        if (document.error) return <RequestError> document.error;
    
        const divs = document.response.getElementsByClassName('uk-margin');
    
        let
            variableName = '',
            variableValue = ''
        ;
    
        for (let i = 0; i < divs.length; i++) {
            switch (i) {
                case CASE.Variable.Name:
                    variableName = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
                case CASE.Variable.Value:
                    variableValue = (divs[i].getElementsByClassName('uk-input')[0] as HTMLInputElement).defaultValue;
                    break;
            }
        }
    
        return <VariableResponse> {
            variableName: variableName,
            variableValue: variableValue
        };
    }

    /**
     * 
     * @param baseData An object containing data for authorization
     * @returns An array containing objects with a variable's info
     */
    static async list(baseData: BaseData): VariableList {
        const document = await request(REQUEST_TYPE.GetCommandsAndVariables, {
            authToken: baseData.authToken,
            botID: baseData.botID
        });
    
        if (document.error) return <RequestError> document.error;
    
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
    
        let variableList = [];
    
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
    
            variableList.push( <VariablesResponse> {
                variableID: variableID,
                variableName: variableName,
                variableValue: variableValue
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
    static async update(baseData: BaseData, variableData: VariableData): UpdateVariable {
        const variableID = variableData?.variableID ? variableData.variableID : '';

        const previous = await this.get({
            authToken:
            baseData.authToken,
            botID: baseData.botID
        }, variableID);

        if (( <RequestError> previous ).status) return previous;
    
        const req = await request(REQUEST_TYPE.UpdateVariable, {
            authToken: baseData.authToken,
            botID: baseData.botID,
            variableData: {
                variableID: variableID,
                variableName: variableData.variableName ?? ( <VariableResponse> previous ).variableName,
                variableValue: variableData.variableValue ?? ( <VariableResponse >previous ).variableValue
            }
        });
    
        if (req.error) return <RequestError> req.error;
    
        return previous;
    }
}
