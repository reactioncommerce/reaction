import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api/";
import { Components } from "@reactioncommerce/reaction-components";


Template.parcelSizeSettings.helpers({
  sizeSettings() {
    const { settings } = Reaction.getPackageSettings("reaction-shipping-parcel-size");
    return {
      component: Components.ParcelSizeSettings,
      settings
    };
  }
});
