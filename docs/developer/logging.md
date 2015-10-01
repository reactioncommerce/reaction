# Logging
## Bunyan
[Bunyan](https://github.com/trentm/node-bunyan) provides a JSON friendly log handler in Reaction Core.

The ongoworks:bunyan package exports `loggers`, and is instantiated by the `ReactionCore.Log` global that can be used anywhere in Reaction code.

To enable logging set/add `isDebug: true` in `settings.json`.  Value can be any valid `bunyan level` in settings.json, or true/false.

Setting a level of _debug_  `isDebug:  "debug"` or higher will display verbose logs as JSON. The JSON format is also the storage / display format for production.

_Recommend running meteor with `--raw-log` to remove Meteor's default console formatting. This is the default when you use `./bin/run` to start Meteor._

Feel free to include verbose logging, but follow [Bunyan recommendations on log levels](https://github.com/trentm/node-bunyan#levels) and use appropriate levels for your messages.

```
The log levels in bunyan are as follows. The level descriptions are best practice opinions.

"fatal" (60): The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
"error" (50): Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
"warn" (40): A note on something that should probably be looked at by an operator eventually.
"info" (30): Detail on regular operation.
"debug" (20): Anything else, i.e. too verbose to be included in "info" level.
"trace" (10): Logging from external libraries used by your app or very detailed application logging.
Suggestions: Use "debug" sparingly. Information that will be useful to debug errors post mortem should usually be included in "info" messages if it's generally relevant or else with the corresponding "error" event. Don't rely on spewing mostly irrelevant debug messages all the time and sifting through them when an error occurs.
```

Example:

```

ReactionCore.Log.info "Something we want to see during development"
```
