import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { check } from "meteor/check";
import { Shops } from "/lib/collections";

Meteor.methods({
  /**
   * separate url into params
   * save params into sellerShop collection
   **/
  "stripeConnect/saveSellerParams": function (shopId, authCode) {
    // add a robust check for stripe connect settings.
    check(authCode, String);
    let result;
    const api_key = Packages.findOne({ name: "reaction-stripe-connect" }).settings.api_key;
    const stripeUrl = "https://connect.stripe.com/oauth/token";
    try {
      result = HTTP.call("POST", stripeUrl, {params: 
        { client_secret: api_key, code: authCode, grant_type: "authorization_code" }
      });
      // check result for correct data
      Shops.update({ shopId }, {
        $set: { stripeConnectSettings: result }
      });
    } catch (error) {
    }
    return result;
  }
});
