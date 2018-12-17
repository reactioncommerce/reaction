import Hooks from "@reactioncommerce/hooks";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import appEvents from "/imports/node-app/core/util/appEvents";
import { Accounts, Groups } from "/lib/collections";

// set default admin user's account as "owner"
Hooks.Events.add("afterCreateDefaultAdminUser", (user) => {
  const group = Groups.findOne({ slug: "owner", shopId: Reaction.getShopId() });
  Accounts.update({ userId: user._id }, { $set: { groups: [group._id] } });

  const account = Accounts.findOne({ userId: user._id });
  Promise.await(appEvents.emit("afterAccountUpdate", {
    updatedBy: null,
    updatedAccount: account
  }));
});
