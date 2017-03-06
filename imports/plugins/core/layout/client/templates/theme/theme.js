import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Reaction, Router } from "/client/api";
import { Packages, Shops } from "/lib/collections";

/**
 * getRouteLayout
 * Gets layout combo based on current route context
 * @param  {Object} context - route context
 * @returns {Object|null} The layout hash
 */
function getRouteLayout(context) {
  const pkg = Packages.findOne({ "registry.name": context.route.name, "enabled": true });

  if (pkg) {
    const registryRoute = pkg.registry.find((x) => {
      return x.name === context.route.name;
    });

    if (registryRoute) {
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

      return currentLayout;
    }
  }

  return null;
}

/**
 * addBodyClasses
 * Adds body classes to help themes distinguish pages and components based on the current route name and layout theme
 * @param  {Object} context - route context
 * @returns {undefined}
 */
function addBodyClasses(context) {
  let classes;

  if (context.route.name === undefined) {
    classes = [
      "app-not-found"
    ];
  } else {
    classes = [
      // push clean route-name
      "app-" + context.route.name.replace(/[\/_]/i, "-")
    ];
  }

  // find the layout combo for this route
  const currentLayout = getRouteLayout(context);

  // add theme class for route layout or default
  if (currentLayout && currentLayout.theme) {
    classes.push(currentLayout.theme);
  } else {
    classes.push("default");
  }

  classes = classes.join(" ");

  $("body").removeClass(Session.get("BODY_CLASS")).addClass(classes);

  // save for removal on next enter
  Session.set("BODY_CLASS", classes);
}

Router.Hooks.onEnter(addBodyClasses);

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
