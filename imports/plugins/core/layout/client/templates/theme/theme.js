import { Reaction, Router } from "/client/api";
import { Packages, Shops } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";

/**
 * getRouteLayout
 * Gets layout combo based on current route context
 * @param  {Object} context - route context
 * @returns {Object|null} The layout hash
 */
function getRouteLayout(context) {
  const registry = Packages.findOne({ "registry.name": context.route.name, "enabled": true }).registry;
  const registryRoute = registry.find((x) => {
    return x.name === context.route.name;
  });

  // set a default layout if none is given
  if (!registryRoute.layout) {
    registryRoute.layout = Session.get("DEFAULT_LAYOUT") || "coreLayout";
  }

  const shop = Shops.findOne(Reaction.getShopId());
  const currentLayout = shop.layout.find((x) => {
    if (x.layout === registryRoute.layout && x.workflow === registryRoute.workflow && x.enabled === true) {
      return true;
    }
  });

  return currentLayout || null;
}

/**
 * addBodyClasses
 * Adds body classes to help themes distinguish pages and components based on route name and theme
 * @param  {Object} context - route context
 */
function addBodyClasses(context) {
  let classes = [
    // push clean route-name
    "app-" + context.route.name.replace(/[\/_]/i, "-")
  ];

  // no theme defined for index
  if (context.route.name !== "index") {
    // find the layout combo for this route
    const currentLayout = getRouteLayout(context);

    if (currentLayout.theme) {
      classes.push(currentLayout.theme);
    }
  }

  classes = classes.join(" ");

  $("body").removeClass(Session.get("BODY_CLASS")).addClass(classes);

  // save for removal on next enter
  Session.set("BODY_CLASS", classes);
}

Router.triggers.enter(addBodyClasses);

Meteor.startup(() => {
  Tracker.autorun(() => {
    const subscription = Reaction.Subscriptions.Shops;
    if (subscription.ready()) {
      const shop = Shops.findOne({});

      if (shop) {
        if (shop.theme) {
          $("#reactionLayoutStyles").text(shop.theme.styles || "");
        } else {
          $("#reactionLayoutStyles").text("");
        }
      }
    }
  });
});
