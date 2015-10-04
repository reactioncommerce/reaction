/**
 * productDetail helpers
 */
Template.productDetail.helpers({
  tags: function () {
    var _ref;
    return _.map((_ref = selectedProduct()) != null ? _ref.hashtags : void 0, function (id) {
      return Tags.findOne(id);
    });
  },
  tagsComponent: function () {
    if (ReactionCore.hasPermission('createProduct')) {
      return Template.productTagInputForm;
    } else {
      return Template.productDetailTags;
    }
  },
  actualPrice: function () {
    var childVariants, current, product, purchasable, variant;
    current = selectedVariant();
    product = selectedProduct();
    if (product && current) {
      childVariants = (function () {
        var _i, _len, _ref, _results;
        _ref = product.variants;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          variant = _ref[_i];
          if ((variant != null ? variant.parentId : void 0) === current._id) {
            _results.push(variant);
          }
        }
        return _results;
      })();
      purchasable = childVariants.length > 0 ? false : true;
    }
    if (purchasable) {
      return current.price;
    } else {
      return getProductPriceRange();
    }
  },
  fieldComponent: function (field) {
    if (ReactionCore.hasPermission('createProduct')) {
      return Template.productDetailEdit;
    } else {
      return Template.productDetailField;
    }
  },
  metaComponent: function () {
    if (ReactionCore.hasPermission('createProduct')) {
      return Template.productMetaFieldForm;
    } else {
      return Template.productMetaField;
    }
  }
});

/**
 * productDetail events
 */

Template.productDetail.events({
  "click #price": function () {
    var formName, v;
    if (ReactionCore.hasPermission('createProduct')) {
      v = selectedVariant();
      if (!v) {
        return;
      }
      if (v.parentId) {
        formName = v.parentId;
      } else {
        formName = v._id;
      }
      formName = "variant-form-" + formName;
      Session.set(formName, true);
      $('#' + formName + ' [name=price]').focus();
    }
  },
  "click #add-to-cart-quantity": function (event, template) {
    event.preventDefault();
    return event.stopPropagation();
  },
  "change #add-to-cart-quantity": function (event, template) {
    var currentVariant, qtyField, quantity;
    event.preventDefault();
    event.stopPropagation();
    currentVariant = selectedVariant();
    if (currentVariant) {
      qtyField = template.$('input[name="addToCartQty"]');
      quantity = qtyField.val();
      if (quantity < 1) {
        quantity = 1;
      }
      if (currentVariant.inventoryPolicy && quantity > currentVariant.inventoryQuantity) {
        qtyField.val(currentVariant.inventoryQuantity);
      }
    }
  },
  "click #add-to-cart": function (event, template) {
    var cartId, count, currentProduct, currentVariant, now, options, productId, qtyField, quantity, variant;
    now = new Date();
    currentVariant = selectedVariant();
    currentProduct = selectedProduct();

    if (currentVariant) {

      if (currentVariant.parentId == null) {
        options = (function () {
          var _i, _len, _ref, _results;
          _ref = currentProduct.variants;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            variant = _ref[_i];
            if (variant.parentId === currentVariant._id) {
              _results.push(variant);
            }
          }
          return _results;
        })();

        if (options.length > 0) {
          Alerts.add("Please choose options before adding to cart", "danger", {
            placement: "productDetail",
            i18nKey: "productDetail.chooseOptions",
            autoHide: 10000
          });
          return;
        }
      }

      if (currentVariant.inventoryPolicy && currentVariant.inventoryQuantity < 1) {
        Alerts.add("Sorry, this item is out of stock!", "danger", {
          placement: "productDetail",
          i18nKey: "productDetail.outOfStock",
          autoHide: 10000
        });
        return;
      }

      qtyField = template.$('input[name="addToCartQty"]');
      quantity = qtyField.val();

      if (quantity < 1) {
        quantity = 1;
      }

      if (!this.isVisible) {
        Alerts.add("Publish product before adding to cart.", "danger", {
          placement: "productDetail",
          i18nKey: "productDetail.publishFirst",
          autoHide: 10000
        });
      } else {
        cartId = ReactionCore.Collections.Cart.findOne()._id;
        productId = currentProduct._id;

        if (cartId && productId) {
          count = ReactionCore.Collections.Cart.findOne(cartId).cartCount() || 0;

          Meteor.call("cart/addToCart", cartId, productId, currentVariant, quantity, function (error, result) {
            var address;
            if (!error && count === 0) {
              address = Session.get("address");
              if (!(address != null ? address.city : void 0)) {
                return locateUser();
              }
            } else if (error) {
              ReactionCore.Log.error("Failed to add to cart.", error);
              return error;
            }
          });
        }

        template.$(".variant-select-option").removeClass("active");
        setCurrentVariant(null);
        qtyField.val(1);

        $('html,body').animate({
          scrollTop: 0
        }, 0);

        $('.cart-alert-text').text(quantity + " " + currentVariant.title + " " + i18n.t('productDetail.addedToCart'));
        return $('.cart-alert').toggle('slide', {
          direction: i18n.t('languageDirection') === 'rtl' ? 'left' : 'right',
          'width': currentVariant.title.length + 50 + "px"
        }, 600).delay(5000).toggle('slide', {
          direction: i18n.t('languageDirection') === 'rtl' ? 'left' : 'right'
        });

      }
    } else {
      Alerts.add("Select an option before adding to cart", "danger", {
        placement: "productDetail",
        i18nKey: "productDetail.selectOption",
        autoHide: 8000
      });
    }
  },
  "click .toggle-product-isVisible-link": function (event, template) {
    var errorMsg, index, variant, _i, _len, _ref;
    errorMsg = "";
    if (!this.title) {
      errorMsg += "Product title is required. ";
      template.$(".title-edit-input").focus();
    }
    _ref = this.variants;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      variant = _ref[index];
      if (!variant.title) {
        errorMsg += "Variant " + (index + 1) + " label is required. ";
      }
      if (!variant.price) {
        errorMsg += "Variant " + (index + 1) + " price is required. ";
      }
    }
    if (errorMsg.length) {
      Alerts.add(errorMsg, "danger", {
        placement: "productManagement",
        i18nKey: "productDetail.errorMsg"
      });
    } else {
      Meteor.call("products/publishProduct", this._id);
    }
  },
  "click .delete-product-link": function (event, template) {
    maybeDeleteProduct(this);
  },
  "click .fa-facebook": function () {
    if (ReactionCore.hasPermission('createProduct')) {
      $(".facebookMsg-edit").fadeIn();
      return $(".facebookMsg-edit-input").focus();
    }
  },
  "click .fa-twitter": function () {
    if (ReactionCore.hasPermission('createProduct')) {
      $(".twitterMsg-edit").fadeIn();
      return $(".twitterMsg-edit-input").focus();
    }
  },
  "click .fa-pinterest": function () {
    if (ReactionCore.hasPermission('createProduct')) {
      $(".pinterestMsg-edit").fadeIn();
      return $(".pinterestMsg-edit-input").focus();
    }
  },
  "click .fa-google-plus": function () {
    if (ReactionCore.hasPermission('createProduct')) {
      $(".googleplusMsg-edit").fadeIn();
      return $(".googleplusMsg-edit-input").focus();
    }
  },
  "focusout .facebookMsg-edit-input,.twitterMsg-edit-input,.pinterestMsg-edit-input,.googleplusMsg-edit": function () {
    Session.set("editing-" + this.field, false);
    return $('.social-media-inputs > *').hide();
  }
});
