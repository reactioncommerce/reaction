import { Meteor } from "meteor/meteor";
import { AnalyticsEvents } from "/lib/collections";
import { Reaction, Logger } from "/server/api";


Meteor.startup(() => {
  let i = 0;

  const handle = Meteor.setInterval(() => {
    i++;
    const shopId = Reaction.getShopId();

    if (shopId) {
      AnalyticsEvents.permit("insert").ifLoggedIn().allowInClientCode();

      AnalyticsEvents.permit(["update", "remove"]).ifHasRole({
        role: ["admin", "owner"],
        group: shopId
      }).allowInClientCode();

      return Meteor.clearInterval(handle);
    }

    if (i > 30) {
      // stop checking and warn if the shopId isn't available within 30 secs
      Meteor.clearInterval(handle);
      Logger.warn("Error getting shopId for 'AnalyticsEvents.permit()'");
    }

    return null;
  }, 1000);
});
