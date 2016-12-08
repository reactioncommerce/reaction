import { Packages } from "/lib/collections";

Template.shippoSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-shippo"
    });
  },

  checkboxAtts() {
    return {
      class: "checkbox-switch"
    };
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
