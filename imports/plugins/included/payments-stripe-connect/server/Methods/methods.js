import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Logger } from "/server/api";

Meteor.methods({
  /**
   * separate url into params
   * save params into sellerShop collection
   **/
    "stripeConnect/saveSellerParams": function(shopId, tokenType, stripePublishableKey, scope, livemode, stripeUserId, refreshToken, accessToken) {
      Logger.warn(url);
      let result;
      try {
        db.SellerShops.save({
            "stripeConnectSettings": {
              "id": shopId,
              "tokenType": token_type,
              "stripePublishableKey": stripe_publishable_key,
              "scope": scope,
              "livemode": livemode,
              "stripeUserId": stripe_user_id,
              "refreshToken": refresh_token,
              "accessToken": access_token
            }
        });
        result = {
          saved: true
        };
      } catch (error) {
        Logger.warn(error);
        result = {
          saved: false,
          error: error
        };
      }
      return result;
    }
});
