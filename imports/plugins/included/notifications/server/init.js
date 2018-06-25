import Hooks from "@reactioncommerce/hooks";
import Reaction from "/imports/plugins/core/core/server/Reaction";

Hooks.Events.add("afterCoreInit", () => {
  Reaction.addRolesToGroups({
    allShops: true,
    groups: ["guest", "customer"],
    roles: ["notifications"]
  });
});
