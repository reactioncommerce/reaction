import { Template } from "meteor/templating";
import { Reaction } from "/lib/api";
import { Router } from "/client/api";
import { Shops } from "/lib/collections";

Template.shopSelect.helpers({
  shops() {
    const currentShopId = Router.getParam("shopId") || 0;
    const selector = {
    };

    // active class
    // TODO: Revise the way active is determined
    const shops = Shops.find(selector).fetch().map((shop) => {
      if (currentShopId && shop._id === currentShopId) {
        shop.class = "active";
      }
      return shop;
    });

    return shops;
  },

  currentShopName() {
    const _id = Reaction.Router.getParam("shopId") || 0;
    let shop;

    if (_id) {
      shop = Shops.findOne({
        _id
      });
    } else {
      shop = Shops.findOne({ _id: Reaction.getShopId() });
    }

    // always make sure we have a shop in case id was incorrect
    if (shop) {
      return shop.name;
    }

    return "Shop Name";
  },

  isOwnerShop() {
    const currentShopId = Reaction.Router.getParam("shopId") || 0;
    return (currentShopId === Reaction.getSellerShopId()); // TODO: Remove getSellerShopId
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
