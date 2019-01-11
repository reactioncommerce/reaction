import Logger from "@reactioncommerce/logger";
import appEvents from "/imports/node-app/core/util/appEvents";
import { Assets } from "/lib/collections";
import MethodHooks from "./method-hooks";
import Reaction from "./Reaction";

appEvents.on("afterCoreInit", () => {
  const shopId = Reaction.getShopId();
  Assets.find({ type: "template" }).forEach((template) => {
    Logger.debug(`Importing ${template.name} template`);
    if (template.content) {
      Reaction.Importer.template(JSON.parse(template.content), shopId);
    } else {
      Logger.debug(`No template content found for ${template.name} asset`);
    }
  });
  Reaction.Importer.flush();

  // Register after hook once core is initialized, otherwise this won't run
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
});
