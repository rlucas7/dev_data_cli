#!/usr/bin/env node

// commander or yargs are options
const { Command } = require('commander');
const program = new Command();
const fs = require('fs');
const readline = require('readline');
const verbose = false;

//TODO: setup logging for this script
var processJsonl = async function processJsonlFile(filePath, opts) {
    let autoCompletions = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity // Handle Windows-style newlines (\r\n)
    });
    for await (const line of rl) {
        try {
            const data = JSON.parse(line);
            if(opts.verbose){
                console.log(data); // Example: log the parsed devdata-log objects
            }
            autoCompletions.push(data);
        } catch (error) {
            console.error('Error parsing JSON line:', error.message);
        }
    }
    if(opts.verbose){
        console.log('Finished processing JSONL file.');
        console.log(`processed ${autoCompletions.length} records`);
        console.log(`record 0 is of type ${typeof(autoCompletions[0])}`);
        console.log(`record 30 is of type ${typeof(autoCompletions[30])}`);
    }

    let autoCompletionEntries = [];
    console.log(autoCompletionEntries[autoCompletionEntries.length-1]);
    // const keepKeys = ["timestamp", "modelName", "eventName", "prompt", "completion", "accepted", "filepath"];
    for (let i=0; i < autoCompletions.length; i++){
        autoCompletionEntries.push({
            timestamp: autoCompletions[i].timestamp,
            modelName: autoCompletions[i].modelName,
            eventName: autoCompletions[i].eventName,
            prompt: autoCompletions[i].prompt,
            completion: autoCompletions[i].completion,
            accepted: autoCompletions[i].accepted,
            filepath: autoCompletions[i].filepath
        });
    }
   console.log(autoCompletionEntries[autoCompletionEntries.length-1]);
};

program
  .name('mycli')
  .description('A simple CLI tool example')
  .option('-v, --verbose', 'Enables verbose mode')
  .option('-f, --filepath', 'Absolute filepath for the autocompletes file')
  .version('1.0.0');

program.command('dev_data')
  .description('Greets the user')
  .action(() => {
    const opts = program.opts();
    let autoCompleteFile = "";
    console.log(opts);
    if (!opts.filepath){
      autoCompleteFile = "/Users/rlucas7/.continue/dev_data/0.2.0/autocomplete.jsonl";
      console.log(`No filepath provided. Using default path: ${autoCompleteFile}`);
    } else {
        autoCompleteFile = opts.filepath;
      console.log(`Using filepath provided: ${autoCompleteFile}`);
    }
    console.log('Processing your continue devData autocompletes!');
    let autoCompletesDevData = processJsonl(autoCompleteFile, opts);
    console.log(`You have ${autoCompletesDevData[0]} autocompletes!`)
    // for now lets parse all the data...
});

program.parse(process.argv);