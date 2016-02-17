ReactionCart = {};
// set logging level
let formatOut = logger.format({
  outputMode: "short",
  levelInString: false
});
ReactionCart.Log = logger.bunyan.createLogger({name: "cart", stream: formatOut});
