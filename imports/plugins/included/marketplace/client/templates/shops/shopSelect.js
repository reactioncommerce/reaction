import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Reaction } from "/lib/api";
import { SellerShops } from "/lib/collections";

Template.shopSelect.onCreated(function () {
  this.currentShopId = new ReactiveVar(Reaction.Router.current().params.shopId);
  this.autorun(() => {
    Meteor.subscribe("SellerShops");

    // watch path change to reset toggle
    Reaction.Router.watchPathChange();
    if (Reaction.Router.current().route.name !== "shop") {
      // set toggle to default
      Template.instance().currentShopId.set(0);
    }
  });
});

Template.shopSelect.helpers({
  sellerShops() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      const sellerShopId = instance.currentShopId.get();
      const selector = {
        // ignore blank site
        _id: {
          $ne: "ddzuN2YPvgvx7rJS5"
        }
      };

      // active class
      const shops = SellerShops.find(selector).fetch().map((shop) => {
        if (shop._id === sellerShopId) {
          shop.class = "active";
        }
        return shop;
      });

      return shops;
    }
  },

  currentShop() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      const _id = instance.currentShopId.get();

      if (_id !== Reaction.getShopId()) {
        const shop = SellerShops.findOne({
          _id
        });
        // always make sure we have a shop in case id was incorrect
        if (shop) {
          return shop.name;
        }
      }
    }
  },

  isChildShop() {
    const currentShopId = Template.instance().currentShopId.get();
    return (currentShopId && Reaction.getSellerShopId() !== currentShopId);
  },

  isOwnerShop() {
    console.log("isOwnerShop", Template.instance().currentShopId.get());
    return (Reaction.getSellerShopId() === Template.instance().currentShopId.get());
  }
});

Template.shopSelect.events({
  "click .shop"(event) {
    event.preventDefault();
    Reaction.Router.go("shop", {
      shopId: this._id
    });
    Template.instance().currentShopId.set(this._id);
  }
});
