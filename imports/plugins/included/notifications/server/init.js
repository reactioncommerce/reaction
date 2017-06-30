import { Reaction, Hooks, Logger } from "/server/api";
import { Groups } from "/lib/collections";

function addRolesToVisitors() { // Question: Visitor sound like Guest, but we're taking defaultRoles as Customer??
    // Add the about permission to all default roles since it's available to all
  Logger.debug("Adding notification route permissions to default roles");
  const update = { $addToSet: { permissions: "notifications" } };
  Groups.update({ shopId: Reaction.getShopId() }, update);
}

Hooks.Events.add("afterCoreInit", () => {
  addRolesToVisitors();
});
