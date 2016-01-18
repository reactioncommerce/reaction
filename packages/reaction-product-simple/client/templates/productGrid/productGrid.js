/**
 * productGrid helpers
 */

/**
 * loadMoreProducts
 * @summary whenever #productScrollLimitLoader becomes visible, retrieve more results
 * this basically runs this:
 * Session.set('productScrollLimit', Session.get('productScrollLimit') + ITEMS_INCREMENT);
 * @return {undefined}
 */
function loadMoreProducts() {
  let threshold;
  let target = $("#productScrollLimitLoader");
  let scrollContainer = $("#reactionAppContainer");

  if (scrollContainer.length === 0) {
    scrollContainer = $(window);
  }

  if (target.length) {
    threshold = scrollContainer.scrollTop() + scrollContainer.height() - target.height();

    if (target.offset().top < threshold) {
      if (!target.data("visible")) {
        target.data("productScrollLimit", true);
        Session.set("productScrollLimit",
          Session.get("productScrollLimit") + ITEMS_INCREMENT || 10);
      }
    } else {
      if (target.data("visible")) {
        target.data("visible", false);
      }
    }
  }
}

Template.productGrid.onCreated(() => {
  Template.instance().selectedProducts = new ReactiveVar([]);
});

Template.productGrid.onRendered(() => {
  // run the above func every time the user scrolls
  $("#reactionAppContainer").on("scroll", loadMoreProducts);
  $(window).on("scroll", loadMoreProducts);
});

Template.productGrid.events({

  "click [data-event-action=loadMoreProducts]": (event) => {
    event.preventDefault();

    loadMoreProducts();
  },

  "change input[name=selectProduct]": (event, template) => {
    let selectedProducts = template.selectedProducts.get();

    if (event.target.checked) {
      selectedProducts.push(event.target.value);
    } else {
      selectedProducts = _.without(selectedProducts, event.target.value);
    }

    template.selectedProducts.set(_.uniq(selectedProducts));
    Session.set("productGrid/selectedProducts", _.uniq(selectedProducts));

    let products = Template.instance().products;
    let filteredProducts = _.filter(products, (product) => {
      return _.contains(selectedProducts, product._id);
    });

    ReactionCore.showActionView({
      label: "Edit Product",
      template: "productSettings",
      type: "product",
      data: {
        products: filteredProducts
      }
    });
  }
});

Template.productGrid.helpers({
  productScrollLimit: function () {
    // if count less rows than we asked for, we've got all the rows in the collection.
    return !(ReactionCore.Collections.Products.find().count() < Session.get(
      "productScrollLimit"));
  },
  products: function () {
    /*
     * take natural sort, sorting by updatedAt
     * then resort using positions.position for this tag
     * retaining natural sort of untouched items
     */
    let hashtags;
    let newRelatedTags;
    let position;
    let relatedTags;

    // function to compare and sort position
    function compare(a, b) {
      if (a.position.position === b.position.position) {
        let x = a.position.updatedAt;
        let y = b.position.updatedAt;

        if (x > y) {
          return -1;
        } else if (x < y) {
          return 1;
        }

        return 0;
      }
      return a.position.position - b.position.position;
    }

    let tag = this.tag || this._id || "";
    let selector = {};

    if (tag) {
      hashtags = [];
      relatedTags = [tag];
      while (relatedTags.length) {
        newRelatedTags = [];
        for (let relatedTag of relatedTags) {
          if (hashtags.indexOf(relatedTag._id) === -1) {
            hashtags.push(relatedTag._id);
          }
        }
        relatedTags = newRelatedTags;
      }
      selector.hashtags = {
        $in: hashtags
      };
    }

    let gridProducts = Products.find(selector).fetch();

    for (let index in gridProducts) {
      if ({}.hasOwnProperty.call(gridProducts, index)) {
        let gridProduct = gridProducts[index];
        if (gridProduct.positions) {
          let _results = [];
          for (position of gridProduct.positions) {
            if (position.tag === ReactionCore.getCurrentTag()) {
              _results.push(position);
            }
            gridProducts[index].position = _results[0];
          }
        }
        if (!gridProduct.position) {
          gridProducts[index].position = {
            position: 0,
            weight: 0,
            pinned: false,
            updatedAt: gridProduct.updatedAt
          };
        }
      }
    }

    const products = gridProducts.sort(compare);
    Template.instance().products = products;
    return products;
  }
});

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
    if (ReactionCore.hasPermission("createProduct")) {
      if (event.shiftKey) {
        event.preventDefault();

        let checkbox = $(`input[type=checkbox][value=${this._id}]`);
        let checked = checkbox.prop("checked");

        checkbox
          .prop("checked", !checked)
          .trigger("change");
      }
    }
  },

  "click [data-event-action=showProductSettings]": function (event) {
    event.preventDefault();

    ReactionCore.showActionView({
      label: "Edit Product",
      template: "productSettings",
      type: "product",
      data: {
        products: [this]
      }
    });
  },
  "click .clone-product": function () {
    let title;
    title = this.title;
    return Meteor.call("products/cloneProduct", this, function (error,
      productId) {
      if (error) {
        throw new Meteor.Error("error cloning product", error);
      }
      Router.go("/product", {
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

/**
 * gridNotice helpers
 */

Template.gridNotice.helpers({
  isLowQuantity: function () {
    let variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }
    if (variants.length > 0) {
      for (let variant of variants) {
        if (variant.inventoryQuantity <= variant.lowInventoryWarningThreshold) {
          return true;
        }
      }
    } else {
      return false;
    }
  },
  isSoldOut: function () {
    let variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }

    if (variants.length > 0) {
      for (let variant of variants) {
        if (!variant.inventoryManagement || variant.inventoryQuantity > 0) {
          return false;
        }
      }
      return true;
    }
  },
  isBackorder: function () {
    let variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }
    if (variants.length > 0) {
      for (let variant of variants) {
        if (!variant.inventoryManagement || variant.inventoryQuantity > 0) {
          return false;
        }
      }
      for (let variant of variants) {
        if (!variant.inventoryPolicy) {
          return true;
        }
      }
      return false;
    }
  }
});

/**
 * gridContent helpers
 */

Template.gridContent.helpers({
  displayPrice: function () {
    if (this._id) {
      return getProductPriceRange(this._id);
    }
  }
});

Template.gridControls.onRendered(function () {
  return this.$("[data-toggle='tooltip']").tooltip({
    position: "top"
  });
});

Template.productGridItems.onRendered(function () {
  if (ReactionCore.hasPermission("createProduct")) {
    let productSort = $(".product-grid-list");
    return productSort.sortable({
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
