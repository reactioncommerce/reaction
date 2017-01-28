import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/lib/api";
import { i18next } from "/client/api";
import { Media } from "/lib/collections";
import { SellerShops } from "../../../lib/collections";

Template.sellerShopSettings.onCreated(function () {
  this.autorun(() => {
    Meteor.subscribe("SellerShops");
  });
});

Template.sellerShopSettings.helpers({
  SellerShops() {
    return SellerShops;
  },

  brandImageSelectProps() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      const sellerShop = Reaction.getSellerShop();

      if (!sellerShop) {
        return;
      }

      const media = Media.find({
        "metadata.type": "brandAsset"
      });

      let selectedMediaId;
      if (_.isArray(sellerShop.brandAssets)) {
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
              return Alerts.toast("Couldn't update brand asset.", "error");
            }

            if (result === 1) {
              Alerts.toast("Updated brand asset", "success");
            }
          });
        }
      };
    }
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
    const instance = Template.instance();

    if (instance.subscriptionsReady()) {
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
    }
  },

  selectedCurrency() {
    const instance = Template.instance();

    if (instance.subscriptionsReady()) {
      const sellerShop = Reaction.getSellerShop();

      if (!sellerShop) {
        return;
      }

      for (const currency in sellerShop.currencies) {
        if (currency === sellerShop.currency) {
          return sellerShop.currencies[currency];
        }
      }
    }
  },

  sellerShop() {
    return Reaction.getSellerShop();
  }
});

/**
 * shopSettings autoform alerts
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
