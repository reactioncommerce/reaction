/**
 * shopSettings helpers
 *
 */
Template.shopSettings.helpers({

  shop: function () {
    return ReactionCore.Collections.Shops.findOne();
  },

  packageData: function () {
    return ReactionCore.Collections.Packages.findOne({
      name: "core"
    });
  },
  addressBook: function () {
    const address = ReactionCore.Collections.Shops.findOne().addressBook;
    return address[0];
  },
  countryOptions: function () {
    return ReactionCore.Collections.Countries.find().fetch();
  },
  currencyOptions: function () {
    const currencies = ReactionCore.Collections.Shops.findOne().currencies;
    const currencyOptions = [];
    for (let currency in currencies) {
      if ({}.hasOwnProperty.call(currencies, currency)) {
        let structure = currencies[currency];
        currencyOptions.push({
          label: currency + "  |  " + structure.symbol + "  |  " +
            structure.format,
          value: currency
        });
      }
    }
    return currencyOptions;
  },
  uomOptions: function () {
    const unitsOfMeasure = ReactionCore.Collections.Shops.findOne().unitsOfMeasure;
    const uomOptions = [];
    for (let measure of unitsOfMeasure) {
      uom = unitsOfMeasure[measure];
      uomOptions.push({
        label: measure.label,
        value: measure.uom
      });
    }
    return uomOptions;
  },
  paymentMethodOptions() {
    const paymentMethods = ReactionCore.Apps({provides: "paymentMethod"});
    const options = [{
      label: "Auto",
      value: "none"
    }];

    if (_.isArray(paymentMethods)) {
      for (let method of paymentMethods) {
        options.push({
          label: method.name,
          value: method.name
        });
      }
    }

    return options;
  }
});

/**
 * shopSettings autoform alerts
 */

AutoForm.hooks({
  shopEditForm: {
    onSuccess: function () {
      return Alerts.add("Shop general settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function (operation, error) {
      return Alerts.add("Shop general settings update failed. " + error,
        "danger");
    }
  }
});

AutoForm.hooks({
  shopEditAddressForm: {
    onSuccess: function () {
      return Alerts.add("Shop address settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function (operation, error) {
      return Alerts.add("Shop address settings update failed. " + error,
        "danger");
    }
  }
});

AutoForm.hooks({
  shopEditEmailForm: {
    onSuccess: function () {
      return Alerts.add("Shop mail settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function (operation, error) {
      return Alerts.add("Shop mail settings update failed. " + error,
        "danger");
    }
  }
});

AutoForm.hooks({
  shopEditExternalServicesForm: {
    onSuccess: function () {
      return Alerts.add("Open Exchange settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function (operation, error) {
      return Alerts.add("Open Exchange settings update failed. " + error,
        "danger");
    }
  }
});

AutoForm.hooks({
  shopEditSettingsForm: {
    onSuccess: function () {
      return Alerts.add("Shop settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function (operation, error) {
      return Alerts.add("Shop setting update failed. " + error, "danger");
    }
  }
});

AutoForm.hooks({
  shopEditOptionsForm: {
    onSuccess: function () {
      return Alerts.add("Shop options saved.", "success", {
        autoHide: true
      });
    },
    onError: function (operation, error) {
      return Alerts.add("Shop options update failed. " + error, "danger");
    }
  }
});
