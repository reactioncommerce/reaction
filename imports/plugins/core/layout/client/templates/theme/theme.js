import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Session } from "meteor/session";
import { $ } from "meteor/jquery";
import { Reaction, Router } from "/client/api";
import { Shops } from "/lib/collections";


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
      `app-${context.route.name.replace(/[/_]/i, "-")}`
    ];
  }


  // add theme class for route layout
  if (context && context.route && context.route.options && context.route.options.theme) {
    classes.push(context.route.options.theme);
  }

  classes = classes.join(" ");

  $("body").removeClass(Session.get("BODY_CLASS")).addClass(classes);

  // save for removal on next enter
  Session.set("BODY_CLASS", classes);
}

Router.Hooks.onEnter(addBodyClasses);

Meteor.startup(() => {
  Tracker.autorun(() => {
    if (Reaction.Subscriptions.PrimaryShop.ready() && Reaction.Subscriptions.MerchantShops.ready()) {
      let shopId;

      // Choose shop to get theme from
      if (Reaction.marketplaceEnabled && Reaction.merchantTheme) {
        shopId = Reaction.getShopId();
      } else {
        shopId = Reaction.getPrimaryShopId();
      }

      const shop = Shops.findOne({
        _id: shopId
      });

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
