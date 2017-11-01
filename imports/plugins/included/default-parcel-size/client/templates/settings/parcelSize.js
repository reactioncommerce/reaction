import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api/";
import { Shops } from "/lib/collections";
import { Components } from "@reactioncommerce/reaction-components";

Template.parcelSizeSettings.helpers({
  sizeSettings() {
    const shop = Shops.findOne({
      _id: Reaction.getShopId()
    });
    const { settings } = Reaction.getPackageSettings("reaction-shipping-parcel-size");
    const defaultParcelSize = shop.defaultParcelSize;

    if (!settings.size) {
      Meteor.call("shipping/size/save", defaultParcelSize);
    }
    return {
      component: Components.ParcelSizeSettings
    };
  }
});
