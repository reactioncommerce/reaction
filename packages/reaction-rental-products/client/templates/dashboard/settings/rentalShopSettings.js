Template.rentalShopSettings.helpers({
  shop: function () {
    return ReactionCore.Collections.Shops.findOne();
  }
});

AutoForm.hooks({
  rentalShopEditForm: {
    onSuccess: function () {
      return Alerts.add('Shop rental settings saved.', 'success', {
        autoHide: true
      });
    },
    onError: function (operation, error) {
      return Alerts.add('Shop rental settings update failed. ' + error, 'danger');
    }
  }
});
