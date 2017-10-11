import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { Reaction } from "/lib/api";
import { SellerShops, Media } from "/lib/collections";
import { i18next } from "/client/api";
import { Countries } from "/client/collections";

Template.sellerShopSettings.onCreated(function () {
  this.autorun(() => {
    this.subscribe("SellerShops");
  });
});

Template.sellerShopSettings.helpers({
  SellerShops() {
    return SellerShops;
  },

  brandImageSelectProps() {
    const sellerShop = Reaction.getSellerShop();

    if (!sellerShop) {
      return;
    }

    const media = Media.find({
      "metadata.type": "brandAsset",
      "metadata.ownerId": Meteor.userId(),
      "metadata.shopId": Reaction.getSellerShopId()
    });

    let selectedMediaId;
    if (Array.isArray(sellerShop.brandAssets)) {
      selectedMediaId = sellerShop.brandAssets[0].mediaId;
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
            return Alerts.toast(i18next.t("shopSettings.shopBrandAssetsFailed"), "error");
          }

          if (result === 1) {
            Alerts.toast(i18next.t("shopSettings.shopBrandAssetsSaved"), "success");
          }
        });
      }
    };
  },

  handleFileUpload() {
    const userId = Meteor.userId();
    const shopId = Reaction.getSellerShopId();

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

  currencyOptions() {
    const sellerShop = Reaction.getSellerShop();

    if (!sellerShop) {
      return;
    }

    const currencies = [];
    for (const currency in sellerShop.currencies) {
      if ({}.hasOwnProperty.call(sellerShop.currencies, currency)) {
        const structure = sellerShop.currencies[currency];
        const option = {
          // TODO global helper needed from i18nSettings.currencyOptions
          label: currency + "  |  " + structure.symbol,
          value: currency
        };

        currencies.push(option);
      }
    }

    return currencies;
  },

  // TODO change for i18n
  countryOptions() {
    return Countries.find().fetch();
  },

  uolOptions() {
    const sellerShop = Reaction.getSellerShop();

    if (!sellerShop) {
      return;
    }

    const unitsOfLength = sellerShop.unitsOfLength;
    const uolOptions = [];
    if (Array.isArray(unitsOfLength)) {
      for (const length of unitsOfLength) {
        uolOptions.push({
          label: i18next.t(`uol.${length.uol}`, { defaultValue: length.uol }),
          value: length.uol
        });
      }
    }
    return uolOptions;
  },

  uomOptions() {
    const sellerShop = Reaction.getSellerShop();

    if (!sellerShop) {
      return;
    }

    const unitsOfMeasure = sellerShop.unitsOfMeasure;
    const uomOptions = [];
    if (Array.isArray(unitsOfMeasure)) {
      for (const measure of unitsOfMeasure) {
        uomOptions.push({
          label: i18next.t(`uom.${measure.uom}`, { defaultValue: measure.uom }),
          value: measure.uom
        });
      }
    }
    return uomOptions;
  },

  selectedCurrency() {
    const sellerShop = Reaction.getSellerShop();

    if (!sellerShop) {
      return;
    }

    for (const currency in sellerShop.currencies) {
      if (currency === sellerShop.currency) {
        return sellerShop.currencies[currency];
      }
    }
  },

  sellerShop() {
    return Reaction.getSellerShop();
  }
});

/**
 * shop settings autoform alerts
 */
AutoForm.hooks({
  sellerShopEditForm: {
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

/**
 * shop address autoform alerts
 */
AutoForm.hooks({
  sellerShopEditAddressForm: {
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
