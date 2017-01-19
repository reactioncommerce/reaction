import _ from "lodash";
import { Template } from "meteor/templating";
import { Reaction } from "/lib/api";
import { i18next } from "/client/api";
import { Media, Packages, Shops } from "/lib/collections";
import { SellerShops } from "../../../lib/collections/schemas";

Template.sellerShopSettings.onCreated(function() {
  this.autorun(() => {
    this.subscribe("SellerShops");
  });
});

Template.sellerShopSettings.helpers({
  currencyOptions() {
    const instance = Template.instance();

    if(instance.subscriptionsReady()) {
      return SellerShops.fetch();
    }

    console.log(instance);
    /*Meteor.call("shop/getSellerShop", Reaction.getSellerShopId(), (error, shop) => {
      return shop;
    });*/
  }
});

/**
 * shopSettings autoform alerts
 */

AutoForm.hooks({
  sellerShopEditForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopGeneralSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopGeneralSettingsFailed")} ${error}`, "error"
      );
    }
  }
});
