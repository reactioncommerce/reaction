import { Shops } from "/lib/collections";
import { Hooks, Logger } from "/server/api";
import { Reaction } from "/server/api";

function addRolesToVisitors() {
  // Add the artlimes/become-seller permission to all default roles since it's available to all

}

/**
 * Hook to make additional configuration changes
 */
Hooks.Events.add("afterCoreInit", function() {

});
