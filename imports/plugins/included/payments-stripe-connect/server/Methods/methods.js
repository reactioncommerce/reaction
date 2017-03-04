import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Logger } from "/server/api";

Meteor.methods({
  /**
   * separate url into params
   * save params into sellerShop collection
   **/
    "stripeConnect/saveSellerParams": function(shopId, url) {
      Logger.warn(url);
      check(url, String);
      let result;
      try {
        let token_type_index = url.indexOf("token_type=");
        let stripe_publishable_key_index = url.indexOf("stripe_publishable_key=");
        let scope_index = url.indexOf("scope=");
        let livemode_index = url.indexOf("livemode=");
        let stripe_user_id_index = url.indexOf("stripe_user_id=");
        let refresh_token_index = url.indexOf("refresh_token=");
        let access_token_index = url.indexOf("access_token=");
        let token_type = url.split(token_type_index, url.indexOf('&', token_type_index));
        let stripe_publishable_key = url.split(stripe_publishable_key_index, url.indexOf('&', stripe_publishable_key_index));
        let scope = url.split(scope_index, url.indexOf('&', scope_index));
        let livemode = url.split(livemode_index, url.indexOf('&', livemode_index));
        let stripe_user_id = url.split(stripe_user_id_index, url.indexOf('&', stripe_user_id_index));
        let refresh_token = url.split(refresh_token_index, url.indexOf('&', refresh_token_index));
        let access_token = url.split(access_token_index, url.indexOf('&', access_token_index));
        //TODO: Add new schema to shop collection or expand current one for these fields?
        db.Shops.save ( { _id: shopId,
                          token_type: token_type,
                          stripe_publishable_key: stripe_publishable_key,
                          scope: scope,
                          livemode: livemode,
                          stripe_user_id: stripe_user_id,
                          refresh_token: refresh_token,
                          access_token: access_token } );
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
