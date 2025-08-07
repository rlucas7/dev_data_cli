#!/usr/bin/env node

// commander or yargs are options
const { plot, Layout } = require('nodeplotlib');
const { Command } = require('commander');
const program = new Command();
const fs = require('fs');
const readline = require('readline');
const winston = require('winston');


var processJsonl = async function processJsonlFile(filePath, opts, logger) {
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

    const autoCompletionEntries = [];
    let acceptedCounter = 0, rejectedCounter = 0;
    // for plotting track the accepted and rejected separately
    const X_a = [], Y_a=[], X_r = [], Y_r=[];
    const dateFilter = new Date(opts.datetime)
    for (let i=0; i < autoCompletions.length; i++){
        // TODO: make this work with '*' extensions, e.g. all the files, an empty
        // string causes all files to be filters
        if(
            opts.extension &&
            autoCompletions[i].filepath.endsWith(opts.extension) &&
            (opts.datetime === 'all' || new Date(autoCompletions[i].timestamp) >= dateFilter)
        ){
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
                X_a.push(new Date(autoCompletions[i].timestamp));
                Y_a.push(autoCompletions[i].completion.length);
                acceptedCounter++;
            } else {
                X_r.push(new Date(autoCompletions[i].timestamp));
                Y_r.push(autoCompletions[i].completion.length);
                rejectedCounter++;
            }
        }
    }
   if(opts.verbose){
       logger.info(autoCompletionEntries[autoCompletionEntries.length-1]);
       logger.info(`processed ${autoCompletionEntries.length} autocompletes`);
   } else {
       logger.info(`processed ${autoCompletionEntries.length} autocompletes, ${autoCompletions.length - autoCompletionEntries.length} were filtered out`);
   }
    logger.info(`Of these ${autoCompletionEntries.length} autocompletes, ${acceptedCounter} were accepted, ${rejectedCounter} were rejected`);
    if(opts.plot){
        if(opts.accepted){
            const layout = { title: "accepted"};
            const accepted_data = [{x: X_a, y: Y_a, mode: 'markers-r', type: 'scatter', name: 'accepted'}];
            logger.info(`Plotting ${accepted_data.length} accepted autocompletes`);
            plot(accepted_data, layout);
        } else {
            const layout = { title: "rejected"};
            const rejected_data = [{x: X_r, y: Y_r, mode: 'markers-a', type: 'scatter', name: 'rejected'}];
            logger.info(`Plotting ${rejected_data.length} rejected autocompletes`);
            plot(rejected_data, layout);
        }
    }
};

program
  .name('devData')
  .description('A simple CLI tool example')
  .option('-v, --verbose', 'Enables verbose mode')
  .option('-f, --filepath <string>', 'Absolute filepath for the autocomplete.jsonl file. Defaults to /Users/$USER/.continue/dev_data/0.2.0/autocomplete.jsonl', undefined)
  .option('-e, --extension <string>', 'Filter the devData to only include file extensions of the given string', '.js')
  .option('-p, --plot', 'Enables plotting the devData')
  .option('-a, --accepted', 'Enables plotting the accepted autocompletes only, otherwise plots the rejected autocompletes', false)
  .option('-d, --datetime <value>', 'Specify a datetime to stop at a specific date/time (e.g., "2025-08-06T10:30:00") will exclude all data before this date/time. If not specified, defaults to "all"', 'all')
  .option('-l, --log-level <level>', 'Set the Winston log level (e.g., debug, info, warn, error)', 'info')
  .version('1.0.0');

program.command('analyze')
  .description('Analyzes the devData autocompletes file')
  .action(() => {
    const opts = program.opts();
    const user = process.env.USER;
    const logger = winston.createLogger({
        level: opts.logLevel || 'info',
        format: winston.format.json(),
        // transports: [new winston.transports.Console()], // Uncomment to log to console
        transports: [new winston.transports.File({ filename: 'dev_data_analyzer.log' })],
    });
    logger.info(`Starting continue dev_data analysis for user: ${user || 'unknown'}`);
    logger.info(`using cli argments: ${JSON.stringify(opts, null, 2)}`);
    const autoCompleteFile = opts.filepath || '/Users/' + user + '/.continue/dev_data/0.2.0/autocomplete.jsonl';
    logger.info(`Using the autocompletes file at: ${autoCompleteFile}`);
    logger.info('Processing your continue devData autocompletes!');
    processJsonl(autoCompleteFile, opts, logger);
    logger.info(`All done processing your continue devData autocompletes!`)
});

program.command('version')
  .description('Displays the version of the devData CLI tool')
  .action(() => {
    console.log(`devData CLI version: ${program.version()}`);
  });

  program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ devData analyze -f /path/to/autocomplete.jsonl -e .js -p');
    console.log('  $ devData version');
    console.log('  $ devData analyze --verbose --log-level debug');
    console.log('  $ devData analyze --datetime "2025-08-05T10:30:00"');
    console.log('');
  });


program.parse(process.argv);