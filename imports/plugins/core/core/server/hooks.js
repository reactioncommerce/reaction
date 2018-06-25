import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import MethodHooks from "./method-hooks";
import Reaction from "./Reaction";

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

Hooks.Events.add("afterCoreInit", () => {
  const shopId = Reaction.getShopId();
  Assets.find({ type: "template" }).forEach((t) => {
    Logger.debug(`Importing ${t.name} template`);
    if (t.content) {
      Reaction.Importer.template(JSON.parse(t.content), shopId);
    } else {
      Logger.debug(`No template content found for ${t.name} asset`);
    }
  });
  Reaction.Importer.flush();
});
