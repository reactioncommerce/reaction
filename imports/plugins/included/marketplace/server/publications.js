import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction } from "/lib/api";
import { Shops, Packages } from "/lib/collections";


Meteor.publish("SellerShops", function (shopIds) {
  check(shopIds, Match.Optional([String]));

  const sellerShopId = Reaction.getSellerShopId(this.userId, true);

  // sub publication for all shops that don't belong to current user
  const sellerShopsSubPub = () => {
    const selector = {};

    if (shopIds) {
      if (sellerShopId) {
        const pubShopIds =  _.without(shopIds, sellerShopId);
        selector._id = { $in: pubShopIds };
      }
    } else {
      if (sellerShopId) {
        selector._id = { $ne: sellerShopId };
      }
    }

    const sellerShopsObserver = Shops.find(selector, {
      fields: { paymentMethods: 0 }
    }).observe({
      added: (document) => {
        this.added("SellerShops", document._id, document);
      },
      changed: (document) => {
        this.changed("SellerShops", document._id, document);
      },
      removed: (document) => {
        this.removed("SellerShops", document._id);
      }
    });

    this.onStop(function () {
      sellerShopsObserver.stop();
    });
  };

  // subPublication for the owner of the shop
  const ownedSellerShopSubPub = () => {
    const ownedSellerShopObserver = Shops.find({ _id: sellerShopId }).observe({
      added: (document) => {
        this.added("SellerShops", document._id, document);
      },
      changed: (document) => {
        this.changed("SellerShops", document._id, document);
      },
      removed: (document) => {
        this.removed("SellerShops", document._id);
      }
    });
    this.onStop(function () {
      ownedSellerShopObserver.stop();
    });
  };

  if (sellerShopId && (!shopIds || shopIds.includes(sellerShopId))) {
    ownedSellerShopSubPub();
  }

  // if we aren't try to get only the shop of the current logged-in seller
  if (!(sellerShopId && shopIds && shopIds.length === 1 && sellerShopId === shopIds[0])) {
    sellerShopsSubPub();
  }

  this.ready();
});

/**
 * MarketplaceShopPackages
 * @summary function to publish packages available for a marketplace shop
 * @param {string} shopID
 * @return {object | boolean }
 */
Meteor.publish("MarketplaceShopPackages", function (shopId) {
  check(shopId, String);

  if (!Reaction.hasPermission("admin", this.userId, Reaction.getPrimaryShopId())) {
    return this.ready();
  }

  const shop = Shops.findOne({ _id: shopId });
  const marketplaceSettings = Reaction.getMarketplaceSettings();
  const packagesConfig =
    marketplaceSettings &&
    marketplaceSettings.shops &&
    marketplaceSettings.shops.enabledPackagesByShopTypes;

  if (shop && Array.isArray(packagesConfig)) {
    const shopTypeConfig = packagesConfig.find((config) => config.shopType === shop.shopType);

    const dashboardOptions = ["settings", "actions"];

    // TODO: Comment
    return Packages.find({
      "registry.provides": { $in: dashboardOptions },
      "name": { $in: shopTypeConfig.enabledPackages },
      shopId
    }, {
      fields: {
        shopId: 1,
        name: 1,
        registry: 1,
        enabled: 1
      }
    });
  }

  return this.ready();
});
