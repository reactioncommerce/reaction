import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { check } from "meteor/check";
import { Shops } from "/lib/collections"; // TODO: Should this be SellerShops?

Meteor.methods({
  // TODO: Review all of this code for functionality
  // separate url into params
  // save params into sellerShop collection
  "stripeConnect/saveSellerParams": function (shopId, authCode) {
    // add a robust check for stripe connect settings.
    check(authCode, String);
    let result;
    const apiKey = Packages.findOne({ name: "reaction-stripe-connect" }).settings.api_key;
    const stripeUrl = "https://connect.stripe.com/oauth/token";
    try {
      result = HTTP.call("POST", stripeUrl, {
        params: {
          client_secret: apiKey, // eslint-disable-line camelcase
          code: authCode,
          grant_type: "authorization_code" // eslint-disable-line camelcase
        }
      });

      // TODO: check result for correct data
      Shops.update({ shopId }, {
        $set: { stripeConnectSettings: result }
      });
    } catch (error) {
      Logger.error(error);
      result = { error };
    }
    return result;
  }
});
