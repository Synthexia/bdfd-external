# Introduction Note

The package was mainly created for better implementation of the Sync feature in our [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Synthexia.bdfd-extension) and for powering our future REST API.

## BDFD External

BDFD External is a package for web scrapping BDFD Web App and make requests to it.
Get your bot list and Get, Update, Create & Delete commands and variables externally!

```sh
npm i @synthexia/bdfd-external
```
```sh
pnpm add @synthexia/bdfd-external
```

## Usage

> Examples are shown in TypeScript. It is recommended to use it with our package.

### User Class

<details><summary>Expand Class Declaration</summary>

```ts
export class User {
    /**
     * Get an authorized user's username 
     * 
     * @param authToken An auth token
     */
    public static get(authToken: string): Promise<string>;
}
```

</details>

```ts
import { User, type Data } from "@synthexia/bdfd-external";

User.get('Auth Token Here')
    .then((username) => {
        console.log(`Successfully authorized as ${username}!`);
    })
    .catch((e: Data.Error) => {
        console.error(`Failed to authorize (request status code: ${e.status})! Error message: ${e.message}`);
    });
```

### Bot Class

<details><summary>Expand Class Declaration</summary>

```ts
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
```

</details>

```ts
import { Bot, type Data } from "@synthexia/bdfd-external";

Bot.list('Auth Token Here')
    .then((botList) => {
        const formattedList: string[] = [];

        for (const bot of botList) formattedList.push(`${bot.name} | ${bot.id}: ${bot.commandCount} and ${bot.variableCount}`);

        console.log('Here is your bots:\n', formattedList.join('\n'));
    })
    .catch((e: Data.Error) => {
        console.error(`Failed to authorize (request status code: ${e.status})! Error message: ${e.message}`);
    });
```
### Command Class

<details><summary>Expand Class Declaration</summary>

```ts
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
```

</details>

```ts
import { Command, LanguageName, type Data } from "@synthexia/bdfd-external";


Command.update('Auth Token Here', 'Bot ID Here', 'Command ID Here', {
    trigger: '!new-cool-trigger',
    languageName: LanguageName.BDSU // Change a command's scripting language to BDScript Unstable; P.S. You should no longer use BDScript Unstable, use BDScript 2 for anything!
})
    .then((oldCommandData) => {
        console.log('A command was updated successfully! Here is its old data before its updation:\n', oldCommandData);
    })
    .catch((e: Data.Error) => {
        console.error(`Failed to authorize (request status code: ${e.status})! Error message: ${e.message}`);
    });
```
### Variable Class

<details><summary>Expand Class Declaration</summary>

```ts
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
```

</details>

```ts
import { Variable, type Data } from "@synthexia/bdfd-external";


Variable.create('Auth Token Here', 'Bot ID Here', {
    name: 'max-warnings',
    value: '3'
})
    .then((variable) => {
        console.log('Successfully created a new variable with the following data:\n', variable);
    })
    .catch((e: Data.Error) => {
        console.error(`Failed to authorize (request status code: ${e.status})! Error message: ${e.message}`);
    });
```