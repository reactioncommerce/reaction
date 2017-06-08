import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";


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
      changed: (newDocument) => {
        this.changed("SellerShops", newDocument._id, newDocument);
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
      changed: (newDocument) => {
        this.changed("SellerShops", newDocument._id, newDocument);
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
