import Logger from "@reactioncommerce/logger";
import appEvents from "/imports/node-app/core/util/appEvents";
import { Assets } from "/lib/collections";
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
});
