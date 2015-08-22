/**
 * shopSettings helpers
 *
 */
Template.shopSettings.helpers({
  packageData: function() {
    return ReactionCore.Collections.Packages.findOne({
      name: "core"
    });
  },
  addressBook: function() {
    var address;
    address = Shops.findOne().addressBook;
    return address[0];
  },
  countryOptions: function() {
    var countries, country, countryOptions, locale;
    countries = ReactionCore.Collections.Shops.findOne().locales.countries;
    countryOptions = [];
    for (locale in countries) {
      country = countries[locale];
      countryOptions.push({
        label: country.name,
        value: locale
      });
    }
    countryOptions.sort(function(a, b) {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
    return countryOptions;
  },
  currencyOptions: function() {
    var currencies, currency, currencyOptions, structure;
    currencies = ReactionCore.Collections.Shops.findOne().currencies;
    currencyOptions = [];
    for (currency in currencies) {
      structure = currencies[currency];
      currencyOptions.push({
        label: currency + "  |  " + structure.symbol + "  |  " + structure.format,
        value: currency
      });
    }
    return currencyOptions;
  },
  uomOptions: function() {
    var measure, unitsOfMeasure, uom, uomOptions;
    unitsOfMeasure = ReactionCore.Collections.Shops.findOne().unitsOfMeasure;
    uomOptions = [];
    for (measure in unitsOfMeasure) {
      uom = unitsOfMeasure[measure];
      uomOptions.push({
        label: uom.name,
        value: measure
      });
    }
    return uomOptions;
  }
});


/**
 * shopSettings autoform alerts
 */

AutoForm.hooks({
  shopEditForm: {
    onSuccess: function(operation, result, template) {
      return Alerts.add("Shop general settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function(operation, error, template) {
      return Alerts.add("Shop general settings update failed. " + error, "danger");
    }
  }
});

AutoForm.hooks({
  shopEditAddressForm: {
    onSuccess: function(operation, result, template) {
      return Alerts.add("Shop address settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function(operation, error, template) {
      return Alerts.add("Shop address settings update failed. " + error, "danger");
    }
  }
});

AutoForm.hooks({
  shopEditEmailForm: {
    onSuccess: function(operation, result, template) {
      return Alerts.add("Shop mail settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function(operation, error, template) {
      return Alerts.add("Shop mail settings update failed. " + error, "danger");
    }
  }
});

AutoForm.hooks({
  shopEditSettingsForm: {
    onSuccess: function(operation, result, template) {
      return Alerts.add("Shop settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function(operation, error, template) {
      return Alerts.add("Shop setting update failed. " + error, "danger");
    }
  }
});

AutoForm.hooks({
  shopEditOptionsForm: {
    onSuccess: function(operation, result, template) {
      return Alerts.add("Shop options saved.", "success", {
        autoHide: true
      });
    },
    onError: function(operation, error, template) {
      return Alerts.add("Shop options update failed. " + error, "danger");
    }
  }
});
