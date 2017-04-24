import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";

Meteor.publish("SellerShops", function (userId) {
  const sellerShopId = Reaction.getSellerShopId(this.userId, true);

  // sub publication for all SellerShop that don't belong to current user
  const sellerShopsSubPub = () => {
    let selector = {};

    if (userId) {
      selector = {
        _id: userId
      };
    } else if (sellerShopId) {
      selector = {
        _id: {
          $ne: sellerShopId
        }
      };
    }

    const sellerShopsObserver = Shops.find(selector, {
      fields: { paymentMethods: 0 }
    }).observe({
      added: (document) => {
        this.added("SellerShops", document._id, document);
      },
      changed: (newDocument) => {
        this.changed("SellerShops", newDocument._id, newDocument);
      }
    });

    this.onStop(function () {
      sellerShopsObserver.stop();
    });
  };

  // subPublication for the owner of the sellerShop
  const ownedSellerShopSubPub = () => {
    const ownedSellerShopObserver = Shops.find({ _id: sellerShopId }).observe({
      added: (document) => {
        this.added("SellerShops", document._id, document);
      },
      changed: (newDocument) => {
        this.changed("SellerShops", newDocument._id, newDocument);
      }
    });
    this.onStop(function () {
      ownedSellerShopObserver.stop();
    });
  };

  if (sellerShopId && (userId === this.userId || !userId)) {
    ownedSellerShopSubPub();
  }

  if (!userId || (sellerShopId && userId !== this.userId)) {
    sellerShopsSubPub();
  }

  this.ready();
});
