Template.socialSettings.helpers({
  packageData: function() {
    return ReactionCore.Collections.Packages.findOne({
      name: 'reaction-social'
    });
  }
});

AutoForm.hooks({
  "social-update-form": {
    onSuccess: function(operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add("Social settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function(operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add("Social settings update failed. " + error, "danger");
    }
  }
});
