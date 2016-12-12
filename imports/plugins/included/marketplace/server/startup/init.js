import { Reaction, Hooks } from "/server/api";

/**
 * Hook to make additional configuration changes		   * Hook to make additional configuration changes
 */
Hooks.Events.add("afterCoreInit", function() {
  // WIP - these might derive from cart, payment and shipping flows with marketplace enabled
  const roles = [
    "marketplace/cart",
    "marketplace/shipping",
    "marketplace/payments"
  ];

  Reaction.addRolesToVisitors(roles);
});
