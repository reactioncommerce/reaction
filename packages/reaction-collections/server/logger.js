ReactionSubscriptions = {};
// set logging level
let formatOut = logger.format({
  outputMode: "short",
  levelInString: false
});
ReactionSubscriptions.Log = logger.bunyan.createLogger({name: "collections", stream: formatOut});
