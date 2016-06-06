ReactionCore.MethodHooks.after("shop/createTag", function (options) {
  if (options.error) {
    ReactionCore.Log.warn("Failed to add new tag:", options.error.reason);
    return options.error;
  }
  if (typeof options.result === "string") {
    ReactionCore.Log.info(`Created tag with _id: ${options.result}`);
  }

  return options.result;
});
