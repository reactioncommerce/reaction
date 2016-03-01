const Media = ReactionCore.Collections.Media;

Template.shopBrandImageOption.helpers({
  cardProps(data) {
    let props = {
      controls: []
    };

    // Add the enable / disable toggle button
    props.controls.push({
      icon: "square-o",
      onIcon: "check-square-o",
      toggle: true,
      toggleOn: data.selected,
      onClick() {
        const asset = {
          mediaId: data.option._id,
          type: "navbarBrandImage"
        };

        Meteor.call("shop/updateBrandAssets", asset, (error, result) => {
          if (error) {
            // Display Error
            return Alerts.toast("Couldn't update brand asset.", "error");
          }

          if (result === 1) {
            Alerts.toast("Updated brand asset", "success");
          }
        });
      }
    });

    // Show the delete button for brand assets that are not enabled.
    // This will prevent users from deleting assets that are being used at the moment.
    if (!data.selected) {
      props.controls.push({
        icon: "trash-o",
        onClick() {
          Alerts.alert({
            title: "Remove this brand image?",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Remove"
          }, () => {
            Media.findOne(data.option._id).remove();
          });
        }
      });
    }

    return props;
  }
});

/**
 * shopSettings helpers
 *
 */
Template.shopSettings.helpers({
  brandImageSelectProps() {
    const media = ReactionCore.Collections.Media.find({
      "metadata.type": "brandAsset"
    });

    const shop = ReactionCore.Collections.Shops.findOne({
      "_id": ReactionCore.getShopId(),
      "brandAssets.type": "navbarBrandImage"
    });

    let selectedMediaId;
    if (_.isArray(shop.brandAssets)) {
      selectedMediaId = shop.brandAssets[0].mediaId;
    }

    return {
      type: "radio",
      options: media,
      key: "_id",
      optionTemplate: "shopBrandImageOption",
      selected: selectedMediaId,
      classNames: {
        itemList: {half: true},
        input: {hidden: true}
      },
      onSelect(value) {
        const asset = {
          mediaId: value,
          type: "navbarBrandImage"
        };

        Meteor.call("shop/updateBrandAssets", asset, (error, result) => {
          if (error) {
            // Display Error
            return Alerts.toast("Couldn't update brand asset.", "error");
          }

          if (result === 1) {
            Alerts.toast("Updated brand asset", "success");
          }
        });
      }
    };
  },

  handleFileUpload() {
    const userId = Meteor.userId();
    const shopId = ReactionCore.getShopId();

    return (files) => {
      for (let file of files) {
        file.metadata = {
          type: "brandAsset",
          ownerId: userId,
          shopId: shopId
        };

        Media.insert(file);
      }
    };
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
  paymentMethodOptions() {
    const paymentMethods = ReactionCore.Apps({provides: "paymentMethod"});
    const options = [{
      label: i18next.t("app.auto"),
      value: "none"
    }];

    if (paymentMethods && _.isArray(paymentMethods)) {
      for (let method of paymentMethods) {
        options.push({
          label: i18next.t(method.i18nKeyLabel),
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
      return Alerts.toast(i18next.t("shopSettings.shopGeneralSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopGeneralSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditAddressForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopAddressSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopAddressSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditEmailForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopMailSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(`${i18next.t("shopSettings.shopMailSettingsFailed")
        } ${error}`, "error");
    }
  }
});

AutoForm.hooks({
  shopEditExternalServicesForm: {
    onSuccess: function () {
      return Alerts.toast(
        i18next.t("shopSettings.shopExternalServicesSettingsSaved"), "success"
      );
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopExternalServicesSettingsFailed")} ${error}`,
        "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditOptionsForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopOptionsSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopOptionsSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditPaymentMethodsForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopPaymentMethodsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopPaymentMethodsFailed")} ${error}`, "error"
      );
    }
  }
});
