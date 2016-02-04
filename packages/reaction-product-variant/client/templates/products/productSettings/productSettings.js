let weightDependency = new Tracker.Dependency;

Template.productSettings.helpers({
  hasSelectedProducts() {
    return this.products.length > 0;
  },
  itemWeightActive: function (weight) {
    weightDependency.depend();

    for (let product of this.products) {
      let position = product.position || {};
      let currentWeight = position.weight || 0;
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
      return ReactionProduct.getProductPriceRange(this._id);
    }
  },

  media: function () {
    let defaultImage;
    const variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }

    if (variants.length > 0) {
      let variantId = variants[0]._id;
      defaultImage = ReactionCore.Collections.Media.findOne({
        "metadata.variantId": variantId,
        "metadata.priority": 0
      });
    }
    if (defaultImage) {
      return defaultImage;
    }
    return false;
  },
  additionalMedia: function () {
    let mediaArray;
    const variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }

    if (variants.length > 0) {
      let variantId = variants[0]._id;
      mediaArray = ReactionCore.Collections.Media.find({
        "metadata.variantId": variantId,
        "metadata.priority": {
          $gt: 0
        }
      }, {
        limit: 3
      });
    }
    if (mediaArray.count() > 1) {
      return mediaArray;
    }
    return false;
  },
  weightClass: function () {
    weightDependency.depend();
    let position = this.position || {};
    let weight = position.weight || 0;
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
    weightDependency.depend();

    let position = this.position || {};
    let weight = position.weight || 0;
    if (weight === 1) {
      return true;
    }
    return false;
  },
  isLargeWeight: function () {
    weightDependency.depend();

    let position = this.position || {};
    let weight = position.weight || 0;
    if (weight === 3) {
      return true;
    }
    return false;
  },
  shouldShowAdditionalImages: function () {
    weightDependency.depend();

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
  "click [data-event-action=deleteProduct]": function () {
    ReactionProduct.maybeDeleteProduct(this.products);
  },
  "click [data-event-action=cloneProduct]": function () {
    let title;
    title = this.title;

    return Meteor.call("products/cloneProduct", this.products, function (error,
      productId) {
      if (error) {
        throw new Meteor.Error("error cloning product", error);
      }
      // ReactionRouter.go("/product", {
      //   _id: productId
      // });
      return Alerts.add("Cloned " + title, "success", {
        placement: "productManagement",
        id: productId,
        i18nKey: "productDetail.cloneMsg",
        autoHide: true,
        dismissable: false
      });
    });
  },

  "click [data-event-action=changeProductWeight]": function (event) {
    event.preventDefault();

    for (product of this.products) {
      let weight = $(event.currentTarget).data("event-data") || 0;
      let position = {
        tag: ReactionCore.getCurrentTag(),
        weight: weight,
        updatedAt: new Date()
      };

      product.position = position;

      Meteor.call("products/updateProductPosition", product._id, position,
        function () {
          weightDependency.changed();
        });
    }
  },

  "click [data-event-action=publishProduct]": function () {
    function callback(error, result) {
      if (error) {
        Alerts.add(error, "danger", {
          placement: "productGridItem",
          id: product._id
        });
        return {};
      }
      if (result === true) {
        return Alerts.add(self.title + " is now visible", "success", {
          placement: "productGridItem",
          type: product._id,
          id: product._id,
          i18nKey: "productDetail.publishProductVisible",
          autoHide: true,
          dismissable: false
        });
      }
      return Alerts.add(self.title + " is hidden", "warning", {
        placement: "productGridItem",
        type: product._id,
        id: product._id,
        i18nKey: "productDetail.publishProductHidden",
        autoHide: true,
        dismissable: false
      });
    };

    for (product of this.products) {
      Meteor.call("products/publishProduct", product._id, callback);
    }
  }

});
