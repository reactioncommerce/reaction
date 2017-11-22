import { Template } from "meteor/templating";
import { Packages } from "/lib/collections";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { AuthNetPackageConfig } from "../../lib/collections/schemas";
import { AuthnetFormContainer } from "../containers";

import "./authnet.html";

Template.authnetSettings.helpers({
  AuthNetPackageConfig() {
    return AuthNetPackageConfig;
  },
  packageData() {
    return Packages.findOne({ name: "reaction-auth-net", shopId: Reaction.getShopId() });
  },

  /**
   * @method authnetForm
   * @summary returns a form component for updating the Authnet settings
   * @since 1.5.2
   * @return {Object} - an object containing the component to render.
   */
  authnetForm() {
    return {
      component: AuthnetFormContainer
    };
  }
});

AutoForm.hooks({
  "authnet-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError: function (error) {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
