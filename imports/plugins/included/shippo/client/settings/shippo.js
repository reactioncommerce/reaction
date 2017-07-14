import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { ShippoPackageConfig } from "../../lib/collections/schemas";

import "./shippo.html";

Template.shippoSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-shippo",
      shopId: Reaction.getShopId()
    });
  },
  ShippoPackageConfig() {
    return ShippoPackageConfig;
  }
});

Template.shippoSettings.events({
  "click [data-event-action=fetchShippoProviders]"(event) {
    event.preventDefault();
    Meteor.call("shippo/fetchProviders");
  }
});

AutoForm.hooks({
  "shippo-update-form": {
    onSuccess(formType, result) {
      Alerts.removeSeen();
      const successMsg = (result.type === "delete") ? i18next.t("admin.settings.saveSuccess") :
        i18next.t("shippo.connectedAndSaved");

      return Alerts.toast(successMsg, "success", {
        autoHide: true
      });
    },
    onError(operation, error) {
      Alerts.removeSeen();

      return Alerts.toast(`Shippo settings update failed. ${error}`, "error");
    }
  }
});
