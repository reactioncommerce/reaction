ReactionCollections = {};
// set logging level
let formatOut = logger.format({
  outputMode: "short",
  levelInString: false
});
ReactionCollections.Log = logger.bunyan.createLogger({name: "collections", stream: formatOut});
