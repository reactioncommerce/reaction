import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Components } from "@reactioncommerce/reaction-components";


Template.parcelSizeSettings.helpers({
  sizeSettings() {
    return {
      component: Components.ParcelSizeSettings
    };
  }
});
