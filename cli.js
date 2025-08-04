#!/usr/bin/env node

// commander or yargs are options
const { Command } = require('commander');
const program = new Command();
const fs = require('fs');
const readline = require('readline');
const verbose = false;


var processJsonl = async function processJsonlFile(filePath) {
    let autoCompletions = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity // Handle Windows-style newlines (\r\n)
    });
    for await (const line of rl) {
        try {
            const data = JSON.parse(line);
            if(verbose){
                console.log(data); // Example: log the parsed devdata-log objects
            }
            autoCompletions.push(data);
        } catch (error) {
            console.error('Error parsing JSON line:', error.message);
        }
    }
    console.log('Finished processing JSONL file.');
    console.log(`processed ${autoCompletions.length} records`);
    console.log(`record 0 is of type ${typeof(autoCompletions[0])}`);
    console.log(`record 30 is of type ${typeof(autoCompletions[30])}`);
    return autoCompletions;
};

program
  .name('mycli')
  .description('A simple CLI tool example')
  .version('1.0.0');

program.command('hello')
  .description('Greets the user')
  .action(() => {
    console.log('Processing your continue devData autocompletes!');
    let autoCompleteFile = "/Users/rlucas7/.continue/dev_data/0.2.0/autocomplete.jsonl";
    let autoCompletesDevData = processJsonl(autoCompleteFile);
});
program.parse(process.argv);
