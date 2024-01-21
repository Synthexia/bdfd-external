# Introduction Note

The package was mainly created for better implementation of the Sync feature in our [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Synthexia.bdfd-extension).

## BDFD External

BDFD External is a package for web scrapping BDFD Web App and make requests to it.
Get your bot list and Get, Update, Create & Delete commands and variables externally!

```sh
npm i @synthexia/bdfd-external | pnpm add @synthexia/bdfd-external
```

## Code Example
```ts
import { type BDFDExternalRequestError, Command } from "@synthexia/bdfd-external";

Command.get(authToken, botId, commandId)
    .then((command) => {
        const { name, trigger, code, language } = command;

        console.log(`The "${name}" command's trigger is "${trigger}"`);
        console.log(`Its scripting language is ${language.name}`);
        console.log('Its code:\n', code);
    })
    .catch((e: BDFDExternalRequestError) => {
        console.error(e.statusCode, e.message);
    });
```