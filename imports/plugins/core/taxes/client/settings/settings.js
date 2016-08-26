import { Template } from "meteor/templating";
import { Packages } from "/lib/collections";
import { TaxCodes } from "../../lib/collections";
import { i18next } from "/client/api";
import { TaxPackageConfig } from "../../lib/collections/schemas";

/*
 * Template taxes Helpers
 */
Template.taxSettings.onCreated(function () {
  this.autorun(() => {
    this.subscribe("TaxCodes");
  });
});

Template.taxSettings.helpers({
  packageConfigSchema() {
    return TaxPackageConfig;
  },
  //
  // check if this package setting is enabled
  //
  checked(pkg) {
    let enabled;
    const pkgData = Packages.findOne(pkg.packageId);
    const setting = pkg.name.split("/").splice(-1);

    if (pkgData && pkgData.settings) {
      if (pkgData.settings[setting]) {
        enabled = pkgData.settings[setting].enabled;
      }
    }
    return enabled === true ? "checked" : "";
  },
  //
  // get current packages settings data
  //
  packageData() {
    return Packages.findOne({
      name: "reaction-taxes"
    });
  },
  //
  // prepare and return taxCodes
  // for default shop value
  //
  taxCodes() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      const taxCodes = TaxCodes.find().fetch();
      const options = [{
        label: i18next.t("app.auto"),
        value: "none"
      }];

      for (const taxCode of taxCodes) {
        options.push({
          label: i18next.t(taxCode.label),
          value: taxCode.id
        });
      }
      return options;
    }
    return undefined;
  },
  //
  // Template helper to add a hidden class if the condition is false
  //
  shown(pkg) {
    let enabled;
    const pkgData = Packages.findOne(pkg.packageId);
    const setting = pkg.name.split("/").splice(-1);

    if (pkgData && pkgData.settings) {
      if (pkgData.settings[setting]) {
        enabled = pkgData.settings[setting].enabled;
      }
    }

    return enabled !== true ? "hidden" : "";
  }
});

Template.taxSettings.events({
  /**
   * taxSettings settings update enabled status for tax service on change
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "change input[name=enabled]": (event) => {
    const name = event.target.value;
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];

    Meteor.call("registry/update", packageId, name, fields);
  },

  /**
   * taxSettings settings show/hide secret key for a tax service
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "click [data-event-action=showSecret]": (event) => {
    const button = $(event.currentTarget);
    const input = button.closest(".form-group").find("input[name=secret]");

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      button.html("Hide");
    } else {
      input.attr("type", "password");
      button.html("Show");
    }
  }
});
