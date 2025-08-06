#!/usr/bin/env node

// commander or yargs are options
const { plot } = require('nodeplotlib');
const { Command } = require('commander');
const program = new Command();
const fs = require('fs');
const readline = require('readline');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  // transports: [new winston.transports.Console()], // Uncomment to log to console
  transports: [new winston.transports.File({ filename: 'dev_data_analyzer.log' })],
});

var processJsonl = async function processJsonlFile(filePath, opts) {
    let autoCompletions = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        // claims to handle Windows-style newlines (\r\n)
        // carriage return-line feed combination
        crlfDelay: Infinity
    });
    for await (const line of rl) {
        try {
            const data = JSON.parse(line);
            if(opts.verbose){
                logger.info(data);
            }
            autoCompletions.push(data);
        } catch (error) {
            console.error('Error parsing JSON line:', error.message);
        }
    }
    if(opts.verbose){
        logger.info('Finished processing JSONL file.');
        logger.info(`processed ${autoCompletions.length} records`);
        logger.info(`record 0 is of type ${typeof(autoCompletions[0])}`);
        logger.info(`record 30 is of type ${typeof(autoCompletions[30])}`);
    }

    let autoCompletionEntries = [];
    logger.info(autoCompletionEntries[autoCompletionEntries.length-1]);
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
            // logger.info(`processed ${new Date(autoCompletions[i].timestamp)} of type: ${typeof(new Date(autoCompletions[i].timestamp))}`);
        }
    }
   if(opts.verbose){
       logger.info(autoCompletionEntries[autoCompletionEntries.length-1]);
       logger.info(`processed ${autoCompletionEntries.length} autocompletes`);
   } else {
       logger.info(`processed ${autoCompletionEntries.length} autocompletes, ${autoCompletions.length - autoCompletionEntries.length} were filtered out`);
   }
    logger.info(`Of these ${acceptedCounter} were accepted, ${rejectedCounter} were rejected`);
    if(opts.plot){
        const data = [{x: X, y: Y, type: 'scatter'}];
        plot(data);
    }
};

program
  .name('devData')
  .description('A simple CLI tool example')
  .option('-v, --verbose', 'Enables verbose mode')
  .option('-f, --filepath <string>', 'Absolute filepath for the autocomplete.jsonl file. Defaults to /Users/$USER/.continue/dev_data/0.2.0/autocomplete.jsonl', undefined)
  .option('-e, --extension <string>', 'Filter the devData to only include file extensions of the given string', '.js')
  .option('-p, --plot', 'Enables plotting the devData')
  .version('1.0.0');

program.command('analyze')
  .description('Analyzes the devData autocompletes file')
  .action(() => {
    const opts = program.opts();
    const user = process.env.USER;
    logger.info(`Starting continue dev_data analysis for user: ${user || 'unknown'}`);
    logger.info(`using cli argments: ${JSON.stringify(opts, null, 2)}`);
    const autoCompleteFile = opts.filepath || '/Users/' + user + '/.continue/dev_data/0.2.0/autocomplete.jsonl';
    logger.info(`Using the autocompletes file at: ${autoCompleteFile}`);
    logger.info('Processing your continue devData autocompletes!');
    processJsonl(autoCompleteFile, opts);
    logger.info(`All done processing your continue devData autocompletes!`)
});

program.parse(process.argv);