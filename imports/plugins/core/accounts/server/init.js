import { Reaction, Hooks } from "/server/api";

Hooks.Events.add("afterCoreInit", () => {
  Reaction.addRolesToDefaultRoleSet({
    allShops: true,
    roleSets: ["defaultRoles", "defaultVisitorRole"],
    roles: ["account/verify"]
  });
});
