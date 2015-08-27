Template.reactionAnalyticsSettings.helpers({
  packageData: function() {
    return ReactionCore.Collections.Packages.findOne({
      name: "reaction-analytics"
    });
  },
  googleAnalyticsEnabled: function() {
    return typeof ga === 'function';
  },
  segmentioEnabled: function() {
    return typeof analytics === 'object';
  },
  mixpanelEnabled: function() {
    return typeof mixpanel === 'object';
  }
});

AutoForm.hooks({
  "analytics-update-form": {
    onSuccess: function(operation, result, template) {
      Alerts.removeType("analytics-not-configured");
      return Alerts.add("Analytics settings saved.", "success", {
        type: "analytics-settings"
      });
    },
    onError: function(operation, error, template) {
      var msg;
      msg = error.message || error.reason || "Unknown error";
      return Alerts.add("Analytics settings update failed: " + msg, "danger", {
        type: "analytics-settings"
      });
    }
  }
});
