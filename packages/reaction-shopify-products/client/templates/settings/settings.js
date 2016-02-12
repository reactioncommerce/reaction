Template.shopifyProductsSettings.helpers({
  packageData: function () {
    return ReactionCore.Collections.Packages.findOne({
      name: 'reaction-shopify-products'
    });
  }
});

AutoForm.hooks({
  'shopify-products-update-form': {
    onSuccess: function () {
      Alerts.removeSeen();
      return Alerts.add('Shopify Products settings saved.', 'success', {
        autoHide: true
      });
    },
    onError: function (operation, error) {
      Alerts.removeSeen();
      return Alerts.add('Shopify Products settings update failed. ' + error, 'danger');
    }
  }
});
