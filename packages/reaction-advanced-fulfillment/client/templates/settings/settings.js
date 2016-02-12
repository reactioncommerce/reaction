Template.advancedFulfillmentSettings.helpers({
  packageData: function () {
    return ReactionCore.Collections.Packages.findOne({
      name: 'reaction-advanced-fulfillment'
    });
  }
});

AutoForm.hooks({
  'advanced-fulfillment-update-form': {
    onSuccess: function (operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add('Advanced Fulfillment settings saved.', 'success', {
        autoHide: true
      });
    },
    onError: function (operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add('Advanced Fulfillment settings update failed. ' + error, 'danger');
    }
  }
});
