import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
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

AutoForm.hooks({
  "shippo-update-form": {
    onSuccess() {
      Alerts.removeSeen();
      return Alerts.toast("Shippo settings saved.", "success", {
        autoHide: true
      });
    },
    onError(operation, error) {
      Alerts.removeSeen();
      return Alerts.toast(`Shippo settings update failed. ${error}`, "error");
    }
  }
});
