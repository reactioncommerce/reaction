import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import { Reaction, Router, i18next } from "/client/api";
import { Packages, Shops } from "/lib/collections";
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

Template.shopifyImport.events({
  "click [data-event-action=importProductsFromShopify]"(event) {
    event.preventDefault();
    $(event.currentTarget).html(`<i class='fa fa-circle-o-notch fa-spin'></i> ${i18next.t("admin.shopifyConnectSettings.importing")}`);
    event.currentTarget.disabled = true;

    // If this is the primary shop, redirect to index
    if (Reaction.getShopId() === Reaction.getPrimaryShopId()) {
      Router.go("index");
    } else {
      const shopId = Reaction.getShopId();
      const shop = Shops.findOne({ _id: shopId });

      // Check to see if this shop has a slug, otherwise direct to shopId route
      if (shop && shop.slug) {
        Router.go(`/shop/${shop.slug}`);
      } else {
        Router.go(`/shop/${shopId}`);
      }
    }

    Meteor.call("connectors/shopify/import/products", (err) => {
      $(event.currentTarget).html(`
          <i class='fa fa-cloud-download'></i> ${i18next.t("admin.shopifyConnectSettings.importProducts")}`);
      event.currentTarget.disabled = false;

      if (!err) {
        return Alerts.toast(i18next.t("admin.shopifyConnectSettings.importSuccess"), "success");
      }
      return Alerts.toast(`${i18next.t("admin.shopifyConnectSettings.importFailed")}: ${err}`, "error");
    });
  }
});

Template.shopifySync.helpers({
  activeWebhooks() {
    const pkg = Packages.findOne({
      name: "reaction-connectors-shopify",
      shopId: Reaction.getShopId()
    });

    if (pkg && pkg.settings && Array.isArray(pkg.settings.webhooks) && pkg.settings.webhooks.length > 0) {
      return true;
    }
    return false;
  },

  integrationIsActive(integration) {
    const { settings } = Reaction.getPackageSettings("reaction-connectors-shopify");
    // If this package has webhooks, determine if there is a match for the `integration` passed in as an arg
    if (settings && Array.isArray(settings.webhooks) && settings.webhooks.length > 0) {
      const integrations = settings.webhooks.reduce((integrationsArray, webhook) => {
        // if this webhook doesn't have any integrations, skip it.
        if (!Array.isArray(webhook.integrations)) {
          return integrationsArray;
        }

        // initialize with first webhook's integrations array
        if (!integrationsArray) {
          return webhook.integrations;
        }

        // Append integrations to integrations array - not unique, but don't really care
        return [...integrationsArray, ...webhook.integrations];
      }, null);

      // Return "checked" if we found the integration, empty string otherwise
      return integrations.indexOf(integration) !== -1 ? "checked" : "";
    }

    // If no webhooks are found, this integration is inactive
    return "";
  }
});

Template.shopifySync.events({
  "submit [data-event-action=setupShopifySync]"(event) {
    event.preventDefault(); // Don't permit default form submission behavior

    // Our event target is the form we submitted
    const form = event.target;

    // Get all selected options
    const selectedOptionsNodeList = form.querySelectorAll('input[type="checkbox"]:checked');

    // Create options array
    // - create an array from the nodelist of checkboxes
    // - map names from checkbox's html name into array
    // - options should be in the form topic:integration
    // - e.g. orders/create:updateInventory
    const integrations = Array.from(selectedOptionsNodeList).map((integration) => integration.name);

    // If there's at least one option
    if (integrations && Array.isArray(integrations) && integrations.length > 0) {
      // setup sync with provided integrations
      return Meteor.call("connectors/shopify/sync/setup", integrations, (err) => {
        if (!err) {
          // If there is no error, notify of success
          return Alerts.toast(i18next.t("admin.shopifyConnectSettings.syncSetupSuccess"), "success");
        }
        // Notify setup sync error if an error is returned
        return Alerts.toast(i18next.t("admin.shopifyConnectSettings.syncSetupFailure"), "error");
      });
    }

    // If no options selected, warn user
    return Alerts.toast(`${i18next.t("admin.shopifyConnectSettings.noSyncIntegrationsSelected")}`, "warning");
  },
  "click [data-event-action=stopShopifySync]"() {
    // setup sync with provided integrations
    return Meteor.call("connectors/shopify/sync/teardown", (err) => {
      if (!err) {
        // If there is no error, notify of success
        return Alerts.toast(i18next.t("admin.shopifyConnectSettings.syncStopSuccess"), "success");
      }
      // Notify setup sync error if an error is returned
      return Alerts.toast(i18next.t("admin.shopifyConnectSettings.syncStopFailure"), "error");
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
