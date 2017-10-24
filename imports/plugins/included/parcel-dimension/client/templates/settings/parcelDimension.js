import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Components } from "@reactioncommerce/reaction-components";

Template.parcelDimensionSettings.helpers({
  dimensionSettings() {
    return {
      component: Components.ParcelDimensionSettings
    };
  }
});
