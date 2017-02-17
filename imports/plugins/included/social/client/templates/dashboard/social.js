import { Packages } from "/lib/collections";
import SocialSettingsContainer from "../../containers/socialSettingsContainer";

Template.socialSettings.helpers({
  SocialSettingsComponent() {
    return {
      component: SocialSettingsContainer
    };
  },

  packageData() {
    return Packages.findOne({
      name: "reaction-social"
    });
  },

  checkboxAtts() {
    return {
      class: "checkbox-switch"
    };
  }
});


AutoForm.hooks({
  "social-update-form": {
    onSuccess() {
      Alerts.removeSeen();
      return Alerts.toast("Social settings saved.", "success", {
        autoHide: true
      });
    },
    onError(operation, error) {
      Alerts.removeSeen();
      return Alerts.toast(`Social settings update failed. ${error}`, "error");
    }
  }
});
