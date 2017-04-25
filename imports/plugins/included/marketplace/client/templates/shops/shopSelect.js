import { Template } from "meteor/templating";
import { Reaction } from "/lib/api";
import { SellerShops } from "/lib/collections";

Template.shopSelect.onCreated(function () {
  this.autorun(() => {
    // watch path change to reset toggle
    Reaction.Router.watchPathChange();
  });
});

Template.shopSelect.helpers({
  sellerShops() {
    const currentShopId = Reaction.Router.getParam("shopId") || 0;
    const selector = {
      // ignore blank site
      // TODO: Don't hardcode IDs to ignore
      _id: {
        $ne: "ddzuN2YPvgvx7rJS5"
      }
    };

    // active class
    const shops = SellerShops.find(selector).fetch().map((shop) => {
      if (currentShopId && shop._id === currentShopId) {
        shop.class = "active";
      }
      return shop;
    });

    return shops;
  },

  currentShopName() {
    const _id = Reaction.Router.getParam("shopId") || 0;

    if (_id && _id !== Reaction.getShopId()) {
      const shop = SellerShops.findOne({
        _id
      });

      // always make sure we have a shop in case id was incorrect
      if (shop) {
        return shop.name;
      }
    }
  },

  isChildShop() {
    const currentShopId = Reaction.Router.getParam("shopId") || 0;
    return (currentShopId && Reaction.getSellerShopId() !== currentShopId);
  },

  isOwnerShop() {
    const currentShopId = Reaction.Router.getParam("shopId") || 0;
    return (currentShopId === Reaction.getSellerShopId());
  }
});

Template.shopSelect.events({
  "click .shop"(event) {
    event.preventDefault();
    Reaction.Router.go("shop", {
      shopId: this._id
    });
  }
});
