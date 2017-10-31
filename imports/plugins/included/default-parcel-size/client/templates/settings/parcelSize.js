import { Template } from "meteor/templating";
import { Reaction } from "/client/api/";
import { Shops } from "/lib/collections";
import { Components } from "@reactioncommerce/reaction-components";


Template.parcelSizeSettings.helpers({
  sizeSettings() {
    const shop = Shops.findOne({
      _id: Reaction.getShopId()
    });
    const defaultParcelSize = shop.defaultParcelSize;
    return {
      component: Components.ParcelSizeSettings,
      defaultParcelSize
    };
  }
});
