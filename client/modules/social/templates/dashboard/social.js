Template.socialSettings.helpers({
  packageData() {
    return ReactionCore.Collections.Packages.findOne({
      name: "reaction-social"
    });
  },

  checkboxAtts: function () {
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
