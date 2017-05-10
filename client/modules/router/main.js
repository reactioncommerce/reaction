import { Meteor } from "meteor/meteor";
import { Router } from "/imports/plugins/core/router/lib";

// Register Global Route Hooks
Meteor.startup(() => {
  // Router.Hooks.onEnter(checkRouterPermissions);
  // Router.Hooks.onEnter(MetaData.init);
  //
  // Router.triggers.enter(Router.Hooks.get("onEnter", "GLOBAL"));
  // Router.triggers.exit(Router.Hooks.get("onExit", "GLOBAL"));
});

export default Router;
