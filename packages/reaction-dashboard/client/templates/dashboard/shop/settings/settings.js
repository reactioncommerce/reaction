let Media = ReactionCore.Collections.Media;

/**
 * uploadHandler method
 */

function uploadHandler(event) {
  const productId = ReactionProduct.selectedProductId();
  const variantId = ReactionProduct.selectedVariantId();
  const shopId = ReactionCore.getShopId();
  const userId = Meteor.userId();
  let count = Media.find({
    "metadata.variantId": variantId
  }).count();

  return FS.Utility.eachFile(event, function (file) {
    let fileObj;
    fileObj = new FS.File(file);
    fileObj.metadata = {
      type: "siteLogo",
      ownerId: userId,
      shopId: shopId,
      priority: count
    };
    const result = Media.insert(fileObj);
    return count++;
  });
}

Template.shopSettings.events({
  "change #files": uploadHandler,
  "dropped #dropzone": uploadHandler
});

/**
 * shopSettings helpers
 *
 */
Template.shopSettings.helpers({
  siteLogos() {
    const media = ReactionCore.Collections.Media.find({
      "metadata.type": "siteLogo"
    });
    return media;
  },
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

    if (paymentMethods && _.isArray(paymentMethods)) {
      for (let method of paymentMethods) {
        options.push({
          label: method.packageName,
          value: method.packageName
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
      return Alerts.toast("Shop general settings saved.", "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(`Shop general settings update failed. ${error}`, "error");
    }
  }
});

AutoForm.hooks({
  shopEditAddressForm: {
    onSuccess: function () {
      return Alerts.toast("Shop address settings saved.", "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(`Shop address settings update failed. ${error}`, "error");
    }
  }
});

AutoForm.hooks({
  shopEditEmailForm: {
    onSuccess: function () {
      return Alerts.toast("Shop mail settings saved.", "success");
    },
    onError: function (operation, error) {
      return Alerts.toast("Shop mail settings update failed. " + error,
        "error");
    }
  }
});

AutoForm.hooks({
  shopEditExternalServicesForm: {
    onSuccess: function () {
      return Alerts.toast("Open Exchange settings saved.", "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(`Open Exchange settings update failed. ${error}`, "error");
    }
  }
});

AutoForm.hooks({
  shopEditSettingsForm: {
    onSuccess: function () {
      return Alerts.toast("Shop settings saved.", "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(`Shop setting update failed. ${error}`, "error");
    }
  }
});

AutoForm.hooks({
  shopEditOptionsForm: {
    onSuccess: function () {
      return Alerts.toast("Shop options saved.", "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(`Shop options update failed. ${error}`, "error");
    }
  }
});
