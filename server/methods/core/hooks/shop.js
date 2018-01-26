import { Logger, MethodHooks } from "/server/api";
// this needed to keep correct loading order. Methods should be loaded before hooks
import "../shop";

MethodHooks.after("shop/createTag", (options) => {
  if (options.error) {
    Logger.warn("Failed to add new tag:", options.error.reason);
    return options.error;
  }
  if (typeof options.result === "string") {
    Logger.debug(`Created tag with _id: ${options.result}`);
  }

  return options.result;
});
