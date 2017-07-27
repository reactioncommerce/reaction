import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { ShopifyConnectPackageConfig } from "../../lib/collections/schemas";

import "./shopify.html";

Template.shopifyConnectSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-connectors-shopify",
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
    $(event.currentTarget).html("<i class='fa fa-circle-o-notch fa-spin'></i> Importing ... This could take a little while.");
    event.currentTarget.disabled = true;

    Meteor.call("shopifyConnect/importProducts", (err) => {
      $(event.currentTarget).html("<i class='fa fa-cloud-download'></i> Import Products");
      event.currentTarget.disabled = false;

      if (!err) {
        return Alerts.toast("Successfully imported products", "success");
      }
    });
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
