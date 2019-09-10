import { Template } from "meteor/templating";
import { Reaction } from "/lib/api";
import { Router } from "/client/api";
import { Shops } from "/lib/collections";

Template.shopSelect.helpers({
  shops() {
    if (Reaction.Subscriptions.PrimaryShop.ready()) {
      return Shops.find();
    }

    return null;
  },

  isActiveShop(shopId) {
    return shopId === Router.getParam("shopId") ? "active" : "";
  },

  currentShopName() {
    const _id = Router.getParam("shopId") || Reaction.getShopId(); // or prime shop
    let shop;

    if (_id) {
      shop = Shops.findOne({
        _id
      });
      if (shop) {
        return shop.name;
      }
    }

    return "Shop Name";
  }
});

Template.shopSelect.events({
  "click .shop"(event) {
    event.preventDefault();
    Router.go("shop", {
      shopId: this._id
    });
  }
});
