import { Reaction, Hooks } from "/server/api";

Hooks.Events.add("afterCoreInit", () => {
  Reaction.addRolesToGroups({
    allShops: true,
    groups: ["customer", "guest"],
    roles: ["reaction-paypal/paypalDone", "reaction-paypal/paypalCancel"]
  });
});
