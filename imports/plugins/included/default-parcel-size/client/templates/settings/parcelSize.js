import { Template } from "meteor/templating";
import { Components } from "@reactioncommerce/reaction-components";

/*
  Template helpers
 */
Template.parcelSizeSettings.helpers({
  /**
   * @method sizeSettings
   * @summary renders ParcelSizeSettings component in template
   * @since 1.5.5
   * @return {Object} component - ParcelSizeSettings
   */
  sizeSettings() {
    return {
      component: Components.ParcelSizeSettings
    };
  }
});
