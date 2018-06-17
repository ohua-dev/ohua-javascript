This is a Javascript-based implementation of the Ohua-Runtime. It is based on Node.js for running on a CLI.

## Setup
* we need to install node first. intruction for this can be found here: https://nodejs.org/en/
* afterwards we need to install a node module called `webworker-threads`. Do so be executing this command on the command line: `npm install webworker-threads`
* the last step is to copy the content of `custom_modules`to the now created dir of `node_modules`. This is necessary to allow node to import these custom modules.

## Usage Generator
The Generator expects a JSON formatted Graph and the required sFn's in the same directory. Invoke the generator by calling:
```node --use_strict generator/generator.mjs <path/to/graph> <number of webworkers> <arguments>```
