import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Media, Packages, Shops } from "/lib/collections";

Template.shopBrandImageOption.helpers({
  cardProps(data) {
    const props = {
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
            return Alerts.toast(i18next.t("shopSettings.shopBrandAssetsFailed"), "error");
          }

          if (result === 1) {
            Alerts.toast(i18next.t("shopSettings.shopBrandAssetsSaved"), "success");
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
  checked(enabled) {
    if (enabled === true) {
      return "checked";
    }
    return "";
  },
  shown(enabled) {
    if (enabled !== true) {
      return "hidden";
    }
    return "";
  },
  brandImageSelectProps() {
    const media = Media.find({
      "metadata.type": "brandAsset"
    });

    const shop = Shops.findOne({
      "_id": Reaction.getShopId(),
      "brandAssets.type": "navbarBrandImage"
    });

    let selectedMediaId;
    if (shop && _.isArray(shop.brandAssets)) {
      selectedMediaId = shop.brandAssets[0].mediaId;
    }

    return {
      type: "radio",
      options: media,
      key: "_id",
      optionTemplate: "shopBrandImageOption",
      selected: selectedMediaId,
      classNames: {
        itemList: { half: true },
        input: { hidden: true }
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
    const shopId = Reaction.getShopId();

    return (files) => {
      for (const file of files) {
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
    return Shops.findOne({
      _id: Reaction.getShopId()
    });
  },
  packageData: function () {
    return Packages.findOne({
      name: "core",
      shopId: Reaction.getShopId()
    });
  },
  addressBook: function () {
    const address = Shops.findOne({
      _id: Reaction.getShopId()
    }).addressBook;
    return address[0];
  },
  showAppSwitch(template) {
    if (template === "optionsShopSettings") {
      // do not have switch for options card/panel
      return false;
    }

    if (Reaction.getMarketplaceSettings()) {
      // if marketplace is enabled, only the primary shop can switch apps on and off.
      return Reaction.getShopId() === Reaction.getPrimaryShopId();
    }

    // If marketplace is disabled, every shop can switch apps
    return true;
  }
});

/**
 * shopSettings autoform alerts
 */

AutoForm.hooks({
  shopEditForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.alerts.shopGeneralSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.alerts.shopGeneralSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditAddressForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.alerts.shopAddressSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.alerts.shopAddressSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditExternalServicesForm: {
    onSuccess: function () {
      return Alerts.toast(
        i18next.t("admin.alerts.shopExternalServicesSettingsSaved"), "success"
      );
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.alerts.shopExternalServicesSettingsFailed")} ${error}`,
        "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditOptionsForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.alerts.shopOptionsSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.alerts.shopOptionsSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

Template.shopSettings.events({
  /**
   * settings update enabled status for services on change
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "change input[name=enabled]": (event) => {
    const settingsKey = event.target.getAttribute("data-key");
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];

    Meteor.call("registry/update", packageId, settingsKey, fields);
    Meteor.call("shop/togglePackage", packageId, !event.target.checked);
  }
});

Template.optionsShopSettings.helpers({
  packageData: function () {
    return Packages.findOne({
      name: "core",
      shopId: Reaction.getShopId()
    });
  }
});
