import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { ShopifyConnectPackageConfig } from "../../lib/collections/schemas";

import "./shopify.html";

Template.shopifyConnectSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-shopify-connect",
      shopId: Reaction.getShopId()
    });
  },
  ShopifyConnectPackageConfig() {
    return ShopifyConnectPackageConfig;
  }
});

Template.shopifyProductImport.events({
  "click [data-event-action=importProductsFromShopify]"(event) {
    event.preventDefault();
    Meteor.call("shopifyConnect/importProducts");
  }
});

AutoForm.hooks({
  "shopify-connect-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError(error) {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
