import { Template } from "meteor/templating";
import { Packages } from "/lib/collections";

import "./authnet.html";

Template.authnetSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-auth-net"
    });
  }
});

AutoForm.hooks({
  "authnet-update-form": {
    onSuccess() {
      Alerts.removeSeen();
      return Alerts.add("Authorize.net settings saved", "success", {
        autoHide: true
      });
    },

    onError(operation, error) {
      Alerts.removeSeen();
      return Alerts.add("Authorize.net settings update failed. " + error, "danger");
    }
  }
});
