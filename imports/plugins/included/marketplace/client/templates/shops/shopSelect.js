import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from 'meteor/reactive-var'
import { Reaction } from "/lib/api";
import { SellerShops, Media } from "/lib/collections";

Template.shopSelect.onCreated(function () {
  this.currentShopId = new ReactiveVar(Reaction.Router.current().params.shopId);
  this.autorun(() => {
    Meteor.subscribe("SellerShops");
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
      const _id = instance.currentShopId.get()

      if (_id) {
        return SellerShops.findOne({
          _id
        }).name;
      }
      return Reaction.getSellerShop().name;
    }
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
