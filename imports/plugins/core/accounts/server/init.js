import Hooks from "@reactioncommerce/hooks";
import Reaction from "/server/api/core";

Hooks.Events.add("afterCoreInit", () => {
  Reaction.addRolesToGroups({
    allShops: true,
    groups: ["guest", "customer"],
    roles: ["account/verify"]
  });
});
