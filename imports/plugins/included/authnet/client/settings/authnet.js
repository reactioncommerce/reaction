import { Template } from "meteor/templating";
import { Packages } from "/lib/collections";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction } from "/client/api";
import { AuthNetPackageConfig } from "../../lib/collections/schemas";

import "./authnet.html";

Template.authnetSettings.helpers({
  AuthNetPackageConfig() {
    return AuthNetPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "reaction-auth-net",
      shopId: Reaction.getShopId()
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
