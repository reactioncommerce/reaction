/**
 * productGridItems helpers
 */

Template.productGridItems.helpers({
  media: function () {
    let defaultImage;
    let variantId;
    let variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }
    if (variants.length > 0) {
      variantId = variants[0]._id;
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
    let variantId;
    let variants = [];

    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }

    if (variants.length > 0) {
      variantId = variants[0]._id;
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
  isSelected(productId) {
    let selectedProducts = Session.get("productGrid/selectedProducts");

    if (_.contains(selectedProducts, this._id)) {
      return "active";
    }

    return "";
  },
  isMediumWeight: function () {
    let position = this.position || {};
    let weight = position.weight || 0;

    if (weight === 1) {
      return true;
    }
    return false;
  },
  isLargeWeight: function () {
    let position = this.position || {};
    let weight = position.weight || 0;
    if (weight === 3) {
      return true;
    }
    return false;
  },
  shouldShowAdditionalImages: function () {
    if (this.isMediumWeight && this.mediaArray) {
      return true;
    }
    return false;
  }
});

/**
 * productGridItems events
 */

Template.productGridItems.events({
  "click [data-event-action=productClick]": function (event) {
    event.preventDefault();
    if (ReactionCore.hasPermission("createProduct")) {
      let checkbox = $(`input[type=checkbox][value=${this._id}]`);
      if (event.metaKey || event.ctrlKey) {
        checkbox.prop("checked", !checkbox.prop("checked")).trigger("change");
      } else if (event.shiftKey) {
        let selected = $('li.product-grid-item.active').length;
        if (selected > 0) {
          let indexes = [$('li.product-grid-item').index(checkbox.parents('li.product-grid-item')),
            $('li.product-grid-item').index($('li.product-grid-item.active').get(0)),
            $('li.product-grid-item').index($('li.product-grid-item.active').get(selected-1))];
          for (let i=_.min(indexes); i<=_.max(indexes); i++) {
            $('input[type=checkbox]', $('li.product-grid-item').get(i)).prop("checked", true).trigger("change");
          }
        }
      }
    }
  },
  "click [data-event-action=selectSingleProduct]": function (event) {
    event.preventDefault();
    let checkbox = $(`input[type=checkbox][value=${this._id}]`);
    Session.set("productGrid/selectedProducts", []);
    checkbox.prop("checked", true).trigger("change");
  },
  "click .clone-product": function () {
    let title;
    title = this.title;
    return Meteor.call("products/cloneProduct", this, function (error,
      productId) {
      if (error) {
        throw new Meteor.Error("error cloning product", error);
      }
      Router.go("product", {
        _id: productId
      });
      return Alerts.add("Cloned " + title, "success", {
        placement: "productManagement",
        id: productId,
        i18nKey: "productDetail.cloneMsg",
        autoHide: true,
        dismissable: false
      });
    });
  },
  "click .delete-product": function (event) {
    event.preventDefault();
    maybeDeleteProduct(this);
  },
  "click .pin-product": function (event) {
    let pin;
    let position;
    event.preventDefault();
    if (this.position.pinned === true) {
      pin = false;
    } else {
      pin = true;
    }
    position = {
      tag: share.tag,
      pinned: pin,
      updatedAt: new Date()
    };
    Meteor.call("products/updateProductPosition", this._id, position);
    return Tracker.flush();
  },
  "click .update-product-weight": function (event) {
    let position;
    let weight;
    event.preventDefault();
    weight = this.position.weight || 0;
    if (weight < 2) {
      weight++;
    } else {
      weight = 0;
    }
    position = {
      tag: share.tag,
      weight: weight,
      updatedAt: new Date()
    };
    Meteor.call("products/updateProductPosition", this._id, position);
    return Tracker.flush();
  },
  "click .publish-product": function () {
    let self;
    self = this;
    return Meteor.call("products/publishProduct", this._id, function (
      error, result) {
      if (error) {
        Alerts.add(error, "danger", {
          placement: "productGridItem",
          id: self._id
        });
        return {};
      }
      if (result === true) {
        return Alerts.add(self.title + " is now visible", "success", {
          placement: "productGridItem",
          type: self._id,
          id: self._id,
          i18nKey: "productDetail.publishProductVisible",
          autoHide: true,
          dismissable: false
        });
      }
      return Alerts.add(self.title + " is hidden", "warning", {
        placement: "productGridItem",
        type: self._id,
        id: self._id,
        i18nKey: "productDetail.publishProductHidden",
        autoHide: true,
        dismissable: false
      });
    });
  }
});




Template.productGridItems.onRendered(function () {
  if (ReactionCore.hasPermission("createProduct")) {
    let productSort = $(".product-grid-list");

    productSort.sortable({
      items: "> li.product-grid-item",
      cursor: "move",
      opacity: 0.5,
      revert: true,
      scroll: false,
      update: function (event, ui) {
        let position;
        let productId = ui.item[0].id;
        let uiPositions = $(this).sortable("toArray", {
          attribute: "data-id"
        });
        let index = _.indexOf(uiPositions, productId);
        let _i;
        let _len;
        for (index = _i = 0, _len = uiPositions.length; _i < _len; index = ++
          _i) {
          productId = uiPositions[index];
          position = {
            tag: ReactionCore.getCurrentTag(),
            position: index,
            updatedAt: new Date()
          };
          Meteor.call("products/updateProductPosition", productId,
            position);
        }
        return Tracker.flush();
      }
    });
  }
});
