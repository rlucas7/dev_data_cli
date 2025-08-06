This is a bare bones CLI tool to analyze developer data from using
continue.dev plugin in vscode.

The current setup works from the terminal.
In the future I may connect this into vscode itself as a plugin.

# commands

## basic
The basic command to the CLI, analyzes the javascript files w/'.js' extensions
and reports back the number of accepted and rejected suggested completions.

```bash
mycli dev_data
```

## verbose output
If you want to see much more reporting etc.
```bash
mycli dev_data -v
```

## filter to specific file extensions
Use a common suffix to filter all suggestions to those suggested
on the suffix. This flag is usually leveraged to do analysis of
only specific programming languages. The default is to filter to
only `.js` file extensions.

E.g. the following example filters to only python language files.
```bash
mycli dev_data -e py
```

## make a plot
Including the `-p` flag will cause the cli to generate a server
in a separate process and render that to the user at the same
time as the other metrics.

```bash
mycli dev_data -p
```

## use an alternate file
The current setup for the continue.dev plugin puts files for all projects into
userspace under `~/.continue`. In the case that you have certain files stored
other locations you can use those by passing in the absolute filepath for the
autocompletions file. This could be from merging several plugin users files
for analysis (e.g. as in a firm) or some other setup, perhaps after a major/minor
version change on the continue app.

```bash
mycli dev_data -f /Users/$USER/.continue/dev_data/0.2.0/autocomplete.jsonl
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


