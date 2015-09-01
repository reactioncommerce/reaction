/**
* productGrid helpers
*/
Template.productGrid.helpers({
  products: function() {

    /*
     * take natural sort, sorting by updatedAt
     * then resort using positions.position for this tag
     * retaining natural sort of untouched items
     */
    var compare, gridProduct, gridProducts, hashtags, index, newRelatedTags, position, relatedTag, relatedTags, selector, _i, _j, _len, _len1, _ref, _ref1;
    compare = function(a, b) {
      var x, y;
      if (a.position.position === b.position.position) {
        x = a.position.updatedAt;
        y = b.position.updatedAt;
        return (x > y ? -1 : (x < y ? 1 : 0));
      }
      return a.position.position - b.position.position;
    };
    tag = (_ref = (_ref1 = this.tag) != null ? _ref1._id : void 0) != null ? _ref : "";
    var selector = {};
    if (this.tag) {
      hashtags = [];
      relatedTags = [this.tag];
      while (relatedTags.length) {
        newRelatedTags = [];
        for (_i = 0, _len = relatedTags.length; _i < _len; _i++) {
          relatedTag = relatedTags[_i];
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
    var gridProducts = Products.find(selector).fetch();
    for (index = _j = 0, _len1 = gridProducts.length; _j < _len1; index = ++_j) {
      gridProduct = gridProducts[index];
      if (gridProducts[index].positions != null) {
        gridProducts[index].position = ((function() {
          var _k, _len2, _ref2, _results;
          _ref2 = gridProduct.positions;
          _results = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            position = _ref2[_k];
            if (position.tag === ReactionCore.getCurrentTag()) {
              _results.push(position);
            }
          }
          return _results;
        })())[0];
      }
      if (!gridProducts[index].position) {
        gridProducts[index].position = {
          position: 0,
          weight: 0,
          pinned: false,
          updatedAt: gridProduct.updatedAt
        };
      }
    }
    return gridProducts.sort(compare);
  }
});

/**
* productGridItems helpers
*/

Template.productGridItems.helpers({
  media: function(variant) {
    var defaultImage, variantId, variants;
    variants = (function() {
      var _i, _len, _ref, _results;
      _ref = this.variants;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variant = _ref[_i];
        if (!variant.parentId) {
          _results.push(variant);
        }
      }
      return _results;
    }).call(this);
    if (variants.length > 0) {
      variantId = variants[0]._id;
      defaultImage = ReactionCore.Collections.Media.findOne({
        'metadata.variantId': variantId,
        'metadata.priority': 0
      });
    }
    if (defaultImage) {
      return defaultImage;
    } else {
      return false;
    }
  },
  additionalMedia: function(variant) {
    var mediaArray, variantId, variants;
    variants = (function() {
      var _i, _len, _ref, _results;
      _ref = this.variants;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variant = _ref[_i];
        if (!variant.parentId) {
          _results.push(variant);
        }
      }
      return _results;
    }).call(this);
    if (variants.length > 0) {
      variantId = variants[0]._id;
      mediaArray = ReactionCore.Collections.Media.find({
        'metadata.variantId': variantId,
        'metadata.priority': {
          '$gt': 0
        }
      }, {
        limit: 3
      });
    }
    if (mediaArray.count() > 1) {
      return mediaArray;
    } else {
      return false;
    }
  },
  weightClass: function() {
    switch (this.position.weight) {
      case 1:
        return 'product-medium';
      case 2:
        return 'product-large';
      default:
        return 'product-small';
    }
  },
  isMediumWeight: function() {
    if (this.position.weight === 1) {
      return true;
    }
    return false;
  },
  isLargeWeight: function() {
    if (this.position.weight === 3) {
      return true;
    }
    return false;
  },
  shouldShowAdditionalImages: function() {
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
  'click [data-event-action=showProductSettings]': function(event, template) {
    event.preventDefault();

    ReactionCore.showAdvancedSettings({
      label: "Edit Product",
      template: "productSettings",
      type: 'product',
      data: this
    });

  },
  'click .clone-product': function() {
    var title;
    title = this.title;
    return Meteor.call("cloneProduct", this, function(error, productId) {
      if (error) {
        throw new Meteor.Error("error cloning product", error);
      }
      Router.go("product", {
        _id: productId
      });
      return Alerts.add("Cloned " + title, "success", {
        'placement': "productManagement",
        'id': productId,
        'i18n_key': "productDetail.cloneMsg",
        'autoHide': true,
        'dismissable': false
      });
    });
  },
  'click .delete-product': function(event, template) {
    event.preventDefault();
    maybeDeleteProduct(this);
  },
  'click .pin-product': function(event, template) {
    var pin, position;
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
    Meteor.call("updateProductPosition", this._id, position);
    return Tracker.flush();
  },
  'click .update-product-weight': function(event, template) {
    var position, weight;
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
    Meteor.call("updateProductPosition", this._id, position);
    return Tracker.flush();
  },
  'click .publish-product': function() {
    var self;
    self = this;
    return Meteor.call("publishProduct", this._id, function(error, result) {
      if (error) {
        Alerts.add(error, "danger", {
          placement: "productGridItem",
          'id': self._id
        });
        return;
      }
      if (result === true) {
        return Alerts.add(self.title + " is now visible", "success", {
          'placement': "productGridItem",
          'type': self._id,
          'id': self._id,
          'i18n_key': "productDetail.publishProductVisible",
          'autoHide': true,
          'dismissable': false
        });
      } else {
        return Alerts.add(self.title + " is hidden", "warning", {
          'placement': "productGridItem",
          'type': self._id,
          'id': self._id,
          'i18n_key': "productDetail.publishProductHidden",
          'autoHide': true,
          'dismissable': false
        });
      }
    });
  }
});

/**
* gridNotice helpers
*/

Template.gridNotice.helpers({
  isLowQuantity: function() {
    var variant, variants, _i, _len;
    variants = (function() {
      var _i, _len, _ref, _results;
      _ref = this.variants;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variant = _ref[_i];
        if (!variant.parentId) {
          _results.push(variant);
        }
      }
      return _results;
    }).call(this);
    if (variants.length > 0) {
      for (_i = 0, _len = variants.length; _i < _len; _i++) {
        variant = variants[_i];
        if (variant.inventoryQuantity <= variant.lowInventoryWarningThreshold) {
          return true;
        }
      }
    } else {
      return false;
    }
  },
  isSoldOut: function() {
    var variant, variants, _i, _len;
    variants = (function() {
      var _i, _len, _ref, _results;
      _ref = this.variants;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variant = _ref[_i];
        if (!variant.parentId) {
          _results.push(variant);
        }
      }
      return _results;
    }).call(this);
    if (variants.length > 0) {
      for (_i = 0, _len = variants.length; _i < _len; _i++) {
        variant = variants[_i];
        if (!variant.inventoryManagement || (variant.inventoryQuantity > 0)) {
          return false;
        }
      }
      return true;
    }
  },
  isBackorder: function() {
    var variant, variants, _i, _j, _len, _len1;
    variants = (function() {
      var _i, _len, _ref, _results;
      _ref = this.variants;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variant = _ref[_i];
        if (!variant.parentId) {
          _results.push(variant);
        }
      }
      return _results;
    }).call(this);
    if (variants.length > 0) {
      for (_i = 0, _len = variants.length; _i < _len; _i++) {
        variant = variants[_i];
        if (!variant.inventoryManagement || (variant.inventoryQuantity > 0)) {
          return false;
        }
      }
      for (_j = 0, _len1 = variants.length; _j < _len1; _j++) {
        variant = variants[_j];
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
  displayPrice: function() {
    if (this._id) {
      return getProductPriceRange(this._id);
    }
  }
});

Template.gridControls.onRendered(function() {
  return this.$('[data-toggle="tooltip"]').tooltip({
    position: 'top'
  });
});


Template.productGridItems.onRendered(function() {
  var productSort;
  if (ReactionCore.hasPermission('createProduct')) {
    productSort = $(".product-grid-list");
    return productSort.sortable({
      items: "> li.product-grid-item",
      cursor: "move",
      opacity: 0.5,
      revert: true,
      scroll: false,
      update: function(event, ui) {
        var index, position, productId, uiPositions, _i, _len;
        productId = ui.item[0].id;
        uiPositions = $(this).sortable("toArray", {
          attribute: "data-id"
        });
        index = _.indexOf(uiPositions, productId);
        for (index = _i = 0, _len = uiPositions.length; _i < _len; index = ++_i) {
          productId = uiPositions[index];
          position = {
            tag: ReactionCore.getCurrentTag(),
            position: index,
            updatedAt: new Date()
          };
          Meteor.call("updateProductPosition", productId, position);
        }
        return Tracker.flush();
      }
    });
  }
});
