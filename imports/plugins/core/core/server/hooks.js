import Logger from "@reactioncommerce/logger";
import MethodHooks from "./method-hooks";

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
