This is a bare bones CLI tool to analyze developer data from using
[continue.dev](https://github.com/continuedev/continue) plugin in vscode.

The current setup works from the terminal.
In the future I may connect this into vscode itself as a plugin.

If you find this interesting you may wish to read the manifesto at the
[amplified.dev](https://amplified.dev/) page, something I believe and have signed on to too.

# installation

For now this package is not packaged and installed via npm
so to use it you need to do:
```bash
git pull git@github.com:rlucas7/dev_data_cli.git
cd dev_data_cli
npm link
dev_data -h
```
and you should see something like

<img width="715" height="438" alt="Screenshot 2025-08-08 at 9 01 25 PM" src="https://github.com/user-attachments/assets/2571c4ba-d10b-4936-ade5-42b737808451" />

# commands

## basic
The basic command to the CLI, analyzes the javascript files w/'.js' extensions
and reports back the number of accepted and rejected suggested completions.

```bash
dev_data analyze
```

## verbose output
If you want to see much more reporting etc.
```bash
dev_data analyze -v
```

## filter to specific file extensions
Use a common suffix to filter all suggestions to those suggested
on the suffix. This flag is usually leveraged to do analysis of
only specific programming languages. The default is to filter to
only `.js` file extensions.

E.g. the following example filters to only python language files.
```bash
dev_data analyze -e py
```

## make a plot
Including the `-p` flag will cause the cli to generate a server
in a separate process and render that to the user at the same
time as the other metrics.

```bash
dev_data analyze -p
```
will show you something like

<img width="1034" height="758" alt="Screenshot 2025-08-08 at 8 38 57 PM" src="https://github.com/user-attachments/assets/1b37ef31-2525-4613-bb34-8920fc8d32da" />

but the lines and dates will look different on your `dev_data`.


## use an alternate file
The current setup for the continue.dev plugin puts files for all projects into
userspace under `~/.continue`. In the case that you have certain files stored
other locations you can use those by passing in the absolute filepath for the
autocompletions file. This could be from merging several plugin users files
for analysis (e.g. as in a firm) or some other setup, perhaps after a major/minor
version change on the continue app.

```bash
dev_data analyze -f /Users/$USER/.continue/dev_data/0.2.0/autocomplete.jsonl
```

# Not implemented

- [] plots direct to filesystem or vscode window
- [] experimental tracking

The wrapper that I use now `nodeplotlib`, is not maintainted but works.

Experimental tracking requires a bit more thinking but is a very handy idea.
In essence you make a configuration change to the continue plugin, e.g. perhaps
you switch models and want to compare if your completion acceptances are greater
with the new model relative to the prior codegen model you used. To answer this
question empirically you need to determine when the change was made and what the
change was that was made to the continue config.


