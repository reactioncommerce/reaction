import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { SellerShops } from "/imports/plugins/included/marketplace/lib/collections";

Meteor.methods({
  /**
   * separate url into params
   * save params into sellerShop collection
   **/
  "stripeConnect/saveSellerParams": function (shopId, stripeConnectSettings) {
    // add a robust check for stripe connect settings.
    check(stripeConnectSettings, Object);
    let result;
    result = SellerShops.update({ shopId }, {
      $set: { stripeConnectSettings: stripeConnectSettings }
    });
    return result;
  }
});
