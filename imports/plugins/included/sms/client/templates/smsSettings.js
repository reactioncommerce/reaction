import { Template } from "meteor/templating";
import { Components } from "@reactioncommerce/reaction-components";

Template.smsSettings.helpers({
  SmsSettings() {
    return {
      component: Components.SmsSettings
    };
  }
});
