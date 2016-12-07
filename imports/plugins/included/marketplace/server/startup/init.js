import { Shops } from "/lib/collections";
import { Hooks, Logger } from "/server/api";
import { Reaction } from "/server/api";


/**
 * Hook to make additional configuration changes
 */
Hooks.Events.add("afterCoreInit", function() {
  //Reaction.addRolesToVisitors("marketplace/");
});
