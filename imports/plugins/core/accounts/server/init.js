import { Reaction, Hooks, Logger } from "/server/api";
import { Shops } from "/lib/collections";

function addRolesToVisitors() {
    // Add the about permission to all default roles since it's available to all
  Logger.debug("Adding account/verify route permissions to default roles");
  const shop = Shops.findOne(Reaction.getShopId());
  Shops.update(shop._id, {
    $addToSet: { defaultRoles: "account/verify" }
  });
}

Hooks.Events.add("afterCoreInit", () => {
  addRolesToVisitors();
});
