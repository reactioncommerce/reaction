import Hooks from "@reactioncommerce/hooks";
import Reaction from "/imports/plugins/core/core/server/Reaction";

// Allow the login forms to be shown to all visitors.
// Without this, the route for the login page will not be published because of permission checks
Hooks.Events.add("afterCoreInit", () => {
  Reaction.addRolesToGroups({
    allShops: true,
    groups: ["guest", "customer"],
    roles: ["account/login", "not-found"]
  });
});
