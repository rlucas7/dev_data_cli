#!/usr/bin/env node

// commander or yargs are options
const { plot } = require('nodeplotlib');
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
    let acceptedCounter = 0, rejectedCounter = 0;
    let X = [], Y=[];
    for (let i=0; i < autoCompletions.length; i++){
        // TODO: make this work with '*' extensions, e.g. all the files, an empty
        // string causes all files to be filters
        if(opts.extension && autoCompletions[i].filepath.endsWith(opts.extension)){
            X.push(new Date(autoCompletions[i].timestamp));
            Y.push(autoCompletions[i].completion.length);
            autoCompletionEntries.push({
                timestamp: new Date(autoCompletions[i].timestamp),
                modelName: autoCompletions[i].modelName,
                eventName: autoCompletions[i].eventName,
                prompt: autoCompletions[i].prompt,
                completion: autoCompletions[i].completion,
                accepted: new Boolean(autoCompletions[i].accepted),
                filepath: autoCompletions[i].filepath
            });
            if(autoCompletions[i].accepted){
                acceptedCounter++;
            } else {
                rejectedCounter++;
            }
            // console.log(`processed ${new Date(autoCompletions[i].timestamp)} of type: ${typeof(new Date(autoCompletions[i].timestamp))}`);
        }
    }
   if(opts.verbose){
       console.log(autoCompletionEntries[autoCompletionEntries.length-1]);
       console.log(`processed ${autoCompletionEntries.length} autocompletes`);
   } else {
       console.log(`processed ${autoCompletionEntries.length} autocompletes, ${autoCompletions.length - autoCompletionEntries.length} were filtered out`);
       // console.log(
   }
    console.log(`Of these ${acceptedCounter} were accepted, ${rejectedCounter} were rejected`);
    if(opts.plot){
        const data = [{x: X, y: Y, type: 'scatter'}];
        plot(data);
    }
};

program
  .name('mycli')
  .description('A simple CLI tool example')
  .option('-v, --verbose', 'Enables verbose mode')
  .option('-f, --filepath <string>', 'Absolute filepath for the autocompletes file', '/Users/rlucas7/.continue/dev_data/0.2.0/autocomplete.jsonl')
  .option('-e, --extension <string>', 'Filter the devData to only include file extensions of the given string', '.js')
  .option('-p, --plot', 'Enables plotting the devData')
  .version('1.0.0');

program.command('dev_data')
  .description('Greets the user')
  .action(() => {
    const opts = program.opts();
    let autoCompleteFile = "";
    console.log(opts);
    autoCompleteFile = opts.filepath;
    console.log('Processing your continue devData autocompletes!');
    processJsonl(autoCompleteFile, opts);
    console.log(`All done processing your continue devData autocompletes!`)
});

program.parse(process.argv);