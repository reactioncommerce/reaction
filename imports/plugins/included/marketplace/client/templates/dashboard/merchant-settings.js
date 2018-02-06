import { Template } from "meteor/templating";

Template.marketplaceMerchantSettings.helpers({
  shown(enabled) {
    if (enabled !== true) {
      return "hidden";
    }
    return "";
  }
});
