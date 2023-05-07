# Let Me Note

The package was mainly created for better implementation of some features in my [VS Code extension](https://marketplace.visualstudio.com/items?itemName=NightNutSky.bdfd-bds) and for powering my future REST API which will let you access below listed features by making HTTP Requests.

The information about how to get your auth token you can find in [This article](https://github.com/NightNutSky/bdfd-bds/blob/master/Sync%20Resources/SYNC.md#get-the-token) of the Sync guide made for my VS Code Extension.

## BDFD External

BDFD External is a package for parsing BDFD Web App and make requests to it.
Get your bot list and Get, Update, Create & Delete commands and variables externally!

```sh
npm i @nightnutsky/bdfd-external
```

## Code Examples

The following examples in TypeScript.\
TypeScript is severely recommended to use for the best experience and practice.

### Get Bot List
```ts
import { Bot } from "@nightnutsky/bdfd-external";
import type {
    BotsResponse,
    RequestError
} from "@nightnutsky/bdfd-external";

Bot.list({
    authToken: 'Your auth token goes here'
}).then(value => {
    const { status, message } = <RequestError> value;
    const list = <BotsResponse[]> value;

    if (status) return console.error(`An error occured with the ${status} status code: ${message}`);

    console.log('Your bot list:', list);
});
```

#### Example Object Response
```js
[
    {
        botID: '1618460',
        botName: 'Fluffy-nyah',
        hostingTime: '2023-05-07T16:46:53Z',
        commandCount: '61 commands',
        variableCount: '34 variables'
    },
    {
        botID: '2152301',
        botName: 'Noriko',
        hostingTime: 'Hosting already ended',
        commandCount: '8 commands',
        variableCount: '3 variables'
    }
]
```

### Get Command
```ts
import { Command } from "@nightnutsky/bdfd-external";
import type {
    CommandResponse, RequestError
} from "@nightnutsky/bdfd-external";

Command.get({
    authToken: 'Your auth token goes here',
    botID: '1234567' /* A BDFD Bot ID */
}, '1234567' /* A BDFD Command ID */).then(value => {
    const { status, message } = <RequestError> value;
    const { commandName, commandTrigger, commandLanguage } = <CommandResponse> value;

    if (status) return console.error(`An error occured with the ${status} status code: ${message}`);

    console.log(`Your "${commandName}" command which has the "${commandTrigger}" command trigger is written in ${commandLanguage}`);
});
```

#### Example Object Response
```js
{
    commandName: 'Hello',
    commandTrigger: '!hellow-world',
    commandLanguage: 'BDScript 2',
    commandLanguageID: '3',
    commandCode: '$nomention\n' + '$allowMention\n' + 'Hello world!'
}
```