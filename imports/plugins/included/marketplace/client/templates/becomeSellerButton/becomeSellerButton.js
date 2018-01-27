import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";

Template.becomeSellerButton.events({
  "click [data-event-action='button-click-become-seller']"() {
    Meteor.call("shop/createShop", Meteor.userId(), (error, response) => {
      if (error) {
        const errorMessage = i18next.t("marketplace.errorCannotCreateShop", { defaultValue: "Could not create shop for current user {{user}}" });
        return Alerts.toast(`${errorMessage} ${error}`, "error");
      }

      const success = i18next.t("marketplace.yourShopIsReady", { defaultValue: "Your shop is now ready!" });
      Reaction.setShopId(response.shopId);
      return Alerts.toast(success, "success");
    });
  }
});
