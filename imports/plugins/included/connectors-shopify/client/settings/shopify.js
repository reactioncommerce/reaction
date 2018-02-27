import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import { Reaction, Router, i18next } from "/client/api";
import { Packages, Shops } from "/lib/collections";
import { ShopifyConnectPackageConfig } from "../../lib/collections/schemas";
import "./shopify.less";
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
  "click [data-event-action=importDataFromShopify]"(event) {
    event.preventDefault();

    if ($("#shopifyCheckboxCustomers").is(":checked") || $("#shopifyCheckboxProducts").is(":checked")) {
      $(event.currentTarget).html(`<i class='fa fa-circle-o-notch fa-spin'></i> ${i18next.t("admin.shopifyConnectSettings.importing")}`);
      event.currentTarget.disabled = true;
    }

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

    // If no option is selected, return error asking user to select type of import
    if (!$("#shopifyCheckboxCustomers").is(":checked") && !$("#shopifyCheckboxProducts").is(":checked")) {
      return Alerts.toast(i18next.t("admin.shopifyConnectSettings.chooseImportType"), "error");
    }
    // TODO transform these Meteor calls to jobs like we do for the products images
    // we got customers checkbox checked ? if yes then download customers
    if ($("#shopifyCheckboxCustomers").is(":checked")) {
      Meteor.call("connectors/shopify/import/customers", (err) => {
        $(event.currentTarget).html(`
            <i class='fa fa-cloud-download'></i> ${i18next.t("admin.shopifyConnectSettings.startImport")}`);
        event.currentTarget.disabled = false;

        if (!err) {
          return Alerts.toast(i18next.t("admin.shopifyConnectSettings.importSuccess"), "success");
        }
        return Alerts.toast(`${i18next.t("admin.shopifyConnectSettings.importFailed")}: ${err}`, "error");
      });
    }
    // we got products checkbox checked ? if yes then download products
    if ($("#shopifyCheckboxProducts").is(":checked")) {
      Meteor.call("connectors/shopify/import/products", (err) => {
        $(event.currentTarget).html(`
            <i class='fa fa-cloud-download'></i> ${i18next.t("admin.shopifyConnectSettings.startImport")}`);
        event.currentTarget.disabled = false;

        if (!err) {
          return Alerts.toast(i18next.t("admin.shopifyConnectSettings.importSuccess"), "success");
        }
        return Alerts.toast(`${i18next.t("admin.shopifyConnectSettings.importFailed")}: ${err}`, "error");
      });
    }
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
  },

  currentDomain() {
    const { settings } = Reaction.getPackageSettings("reaction-connectors-shopify");
    return settings.webhooksDomain || Meteor.absoluteUrl();
  },

  hookIsActive(hook) {
    const { settings } = Reaction.getPackageSettings("reaction-connectors-shopify");
    const { synchooks } = settings;
    if (synchooks) {
      const [topic, event, syncType] = hook.split(":");
      const matchingHooks = synchooks.filter((synchook) => synchook.topic === topic && synchook.event === event && synchook.syncType === syncType);

      if (matchingHooks.length > 0) {
        return "checked";
      }
    }
    return "";
  }
});

Template.shopifySync.events({
  "submit [data-event-action=setupShopifySync]"(event) {
    event.preventDefault(); // Don't permit default form submission behavior

    const { settings } = Reaction.getPackageSettings("reaction-connectors-shopify");

    // Our event target is the form we submitted
    const form = event.target;

    // Get all selected options
    const selectedOptionsNodeList = form.querySelectorAll('input[type="checkbox"]:checked');
    const webhooksDomain = document.getElementsByName("webhooksDomain")[0].value;

    if (!webhooksDomain) {
      return Alerts.toast(`${i18next.t("admin.shopifyConnectSettings.noDomainSelected")}`, "warning");
    }

    if (settings.webhooksDomain !== webhooksDomain) {
      settings.webhooksDomain = webhooksDomain;
      Meteor.call("package/update", "reaction-connectors-shopify", "settings", settings);
    }

    // Create options array
    // - create an array from the nodelist of checkboxes
    // - map names from checkbox's html name into array
    // - options should be in the form topic:integration
    // - e.g. orders/create:updateInventory
    const integrations = Array.from(selectedOptionsNodeList).map((integration) => integration.name);
    // If there's at least one option
    if (integrations && Array.isArray(integrations) && integrations.length > 0) {
      // setup sync with provided integrations
      return Meteor.call("connectors/shopify/sync/setup", integrations, webhooksDomain, (err) => {
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
  },

  "submit [data-event-action=setupShopifyHooks]"(formEvent) {
    event.preventDefault();
    const form = formEvent.target;
    const optionsNodeList = form.querySelectorAll('input[type="checkbox"]');
    const optionsList = Array.from(optionsNodeList).map((hook) => ({ name: hook.name, checked: hook.checked }));
    optionsList.forEach((node) => {
      if (node.checked) {
        Meteor.call("synchooks/shopify/addHook", node, (error) => {
          if (!error) {
            Alerts.toast(i18next.t("admin.shopifyConnectSettings.hookSetupSuccess"), "success");
          } else {
            Alerts.toast(i18next.t("admin.shopifyConnectSettings.hookSetupFailure"), "error");
          }
        });
      } else {
        Meteor.call("synchooks/shopify/removeHook", node, (error) => {
          if (!error) {
            Alerts.toast(i18next.t("admin.shopifyConnectSettings.hookSetupSuccess"), "success");
          } else {
            Alerts.toast(i18next.t("admin.shopifyConnectSettings.hookSetupFailure"), "error");
          }
        });
      }
    });
  }
});

AutoForm.hooks({
  "shopify-connect-update-form": {
    onSuccess() {
      Meteor.call("connectors/shopify/api/credentials/test", (err, isValid) => {
        if (isValid) {
          return Alerts.toast(i18next.t("admin.shopifyConnectSettings.validCredentials"), "Valid API key and password");
        }
        return Alerts.toast(i18next.t("admin.shopifyConnectSettings.invalidCredentials", "Invalid API key/password"), "error");
      });
    },
    onError(error) {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
