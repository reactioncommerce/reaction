import _ from "lodash";
import { ReactiveDict } from "meteor/reactive-dict";
import Logger from "/client/modules/logger";
import { ReactionProduct } from "/lib/api";
import { Media, Products } from "/lib/collections";

Template.productSettings.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    products: []
  });

  this.autorun(() => {
    const currentData = Template.currentData();

    if (_.isArray(currentData.products)) {
      const productIds = currentData.products.map((product) => {
        return product._id;
      });

      const products = Products.find({
        _id: {
          $in: productIds
        }
      }).fetch();

      this.state.set("products", products);
    }
  });
});

Template.productSettings.helpers({
  hasSelectedProducts() {
    return this.products.length > 0;
  },
  itemWeightActive: function (weight) {
    const instance = Template.instance();
    const products = instance.state.get("products");
    const tag = ReactionProduct.getTag();

    for (let product of products) {
      let positions = product.positions && product.positions[tag] || {};
      let currentWeight = positions.weight || 0;
      if (currentWeight === weight) {
        return "active";
      }
    }
    return "";
  }
});

Template.productSettingsGridItem.helpers({
  displayPrice: function () {
    if (this._id) {
      return ReactionProduct.getProductPriceRange(this._id).range;
    }
  },

  media: function () {
    const media = Media.findOne({
      "metadata.productId": this._id,
      "metadata.priority": 0,
      "metadata.toGrid": 1
    }, { sort: { uploadedAt: 1 } });

    return media instanceof FS.File ? media : false;
  },
  additionalMedia: function () {
    const mediaArray = Media.find({
      "metadata.productId": this._id,
      "metadata.priority": {
        $gt: 0
      },
      "metadata.toGrid": 1
    }, { limit: 3 });

    if (mediaArray.count() > 1) {
      return mediaArray;
    }
    return false;
  },
  weightClass: function () {
    const tag = ReactionProduct.getTag();
    const positions = this.positions && this.positions[tag] || {};
    const weight = positions.weight || 0;
    switch (weight) {
    case 1:
      return "product-medium";
    case 2:
      return "product-large";
    default:
      return "product-small";
    }
  },

  isMediumWeight: function () {
    const tag = ReactionProduct.getTag();
    const positions = this.positions && this.positions[tag] || {};
    const weight = positions.weight || 0;
    return weight === 1;
  },
  isLargeWeight: function () {
    const tag = ReactionProduct.getTag();
    const positions = this.positions && this.positions[tag] || {};
    const weight = positions.weight || 0;
    return weight === 3;
  },
  shouldShowAdditionalImages: function () {
    if (this.isMediumWeight && this.mediaArray) {
      return true;
    }
    return false;
  }
});

Template.productSettingsListItem.inheritsHelpersFrom("productSettingsGridItem");

/**
 * productExtendedControls events
 */

Template.productSettings.events({
  "click [data-event-action=publishProduct]": function () {
    ReactionProduct.publishProduct(this.products);
  },
  "click [data-event-action=cloneProduct]": function () {
    ReactionProduct.cloneProduct(this.products);
  },
  "click [data-event-action=deleteProduct]": function () {
    ReactionProduct.maybeDeleteProduct(this.products);
  },
  "click [data-event-action=changeProductWeight]": function (event) {
    event.preventDefault();
    const tag = ReactionProduct.getTag();
    for (let product of this.products) {
      let weight = $(event.currentTarget).data("event-data") || 0;
      let positions = {
        weight: weight,
        updatedAt: new Date()
      };
      Meteor.call("products/updateProductPosition", product._id, positions, tag,
        (error) => {
          if (error) {
            Logger.warn(error);
            throw new Meteor.Error(403, error);
          }
        }
      );
    }
  }
});
