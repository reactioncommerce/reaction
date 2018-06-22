import Hooks from "@reactioncommerce/hooks";
import { Reaction } from "/server/api";

Hooks.Events.add("afterCoreInit", () => {
  Reaction.addRolesToGroups({
    allShops: true,
    groups: ["guest", "customer"],
    roles: ["notifications"]
  });
});
