import { Reaction, Hooks } from "/server/api";

/**
 * Hook to make additional configuration changes		   * Hook to make additional configuration changes
 */
Hooks.Events.add("afterCoreInit", function() {
  // WIP - these might or might not derive from the cart, payment and shipping flows
  const roles = [
    "marketplace/cart",
    "marketplace/shipping",
    "marketplace/payments"
  ];

  Reaction.addRolesToVisitors(roles);
});
