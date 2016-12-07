import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import { ExamplePackageConfig } from "../../lib/collections/schemas";

import "./example.html";


Template.exampleSettings.helpers({
  ExamplePackageConfig() {
    return ExamplePackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "example-paymentmethod",
      shopId: Reaction.getShopId()
    });
  }
});


Template.example.helpers({
  packageData: function () {
    return Packages.findOne({
      name: "example-paymentmethod",
      shopId: Reaction.getShopId()
    });
  }
});

Template.example.events({
  "click [data-event-action=showExampleSettings]": function () {
    Reaction.showActionView();
  }
});

AutoForm.hooks({
  "example-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError: function () {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
