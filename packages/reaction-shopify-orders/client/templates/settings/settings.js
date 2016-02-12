Template.shopifyOrdersSettings.helpers({
  packageData: function () {
    return ReactionCore.Collections.Packages.findOne({
      name: 'reaction-shopify-orders'
    });
  }
});


AutoForm.hooks({
  'shopify-orders-update-form': {
    onSuccess: function (operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add('Shopify Orders settings saved.', 'success', {
        autoHide: true
      });
    },
    onError: function (operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add('Shopify Orders settings update failed. ' + error, 'danger');
    }
  }
});
