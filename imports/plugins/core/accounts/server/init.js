import Hooks from "@reactioncommerce/hooks";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Accounts, Groups } from "/lib/collections";

// set default admin user's account as "owner"
Hooks.Events.add("afterCreateDefaultAdminUser", (user) => {
  const group = Groups.findOne({ slug: "owner", shopId: Reaction.getShopId() });
  Accounts.update({ _id: user._id }, { $set: { groups: [group._id] } });
  Hooks.Events.run("afterAccountsUpdate", null, {
    accountId: user._id,
    updatedFields: ["groups"]
  });
});

Hooks.Events.add("afterCoreInit", () => {
  Reaction.addRolesToGroups({
    allShops: true,
    groups: ["guest", "customer"],
    roles: ["account/verify"]
  });
});
