import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { check } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { Packages } from "/lib/collections";

Meteor.methods({
  // separate url into params
  // save params into sellerShop collection
  "stripe/connect/authorizeMerchant": function (shopId, authCode) {
    check(shopId, String);
    check(authCode, String);

    console.log("stripe/connect/authorizeMerchant called", shopId, authCode);
    if (!Reaction.hasPermission(["owner", "admin", "reaction-stripe"], Meteor.userId(), shopId)) {
      Logger.warn(`user: ${Meteor.userId()} attempted to authorize merchant account
        for shopId ${shopId} but was denied access due to insufficient privileges.`);
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    let result;
    const primaryShopId = Reaction.getPrimaryShopId();
    const stripePkg = Reaction.getPackageSettingsWithOptions({
      shopId: primaryShopId,
      name: "reaction-stripe"
    });

    if (!stripePkg || !stripePkg.settings || !stripePkg.settings.api_key) {
      throw new Meteor.Error("Cannot authorize stripe connect merchant. Primary shop stripe must be configured.");
    }

    const merchantStripePkg = Reaction.getPackageSettingsWithOptions({
      shopId: shopId,
      name: "reaction-stripe"
    });

    const apiKey = stripePkg.settings.api_key;
    const stripeAuthUrl = "https://connect.stripe.com/oauth/token";
    try {
      result = HTTP.call("POST", stripeAuthUrl, {
        params: {
          client_secret: apiKey, // eslint-disable-line camelcase
          code: authCode,
          grant_type: "authorization_code" // eslint-disable-line camelcase
        }
      });

      console.log("Stripe auth result", result);

      if (result.error) {
        throw new Meteor.Error("There was a problem authorizing stripe connect", result.error, result.error_description);
      }

      if (result && result.data) {
        // Setup connectAuth settings for this merchant
        Packages.update({ _id: merchantStripePkg._id }, {
          $set: {
            "settings.connectAuth": result.data
          }
        });
      }
    } catch (error) {
      Logger.error(error);
      result = { error };
    }
    return result;
  }
});
