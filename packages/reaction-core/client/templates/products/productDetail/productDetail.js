/**
 * productDetail helpers
 */
Template.productDetail.helpers({
  tags: function () {
    let product = selectedProduct();
    if (product) {
      if (product.hashtags) {
        return _.map(product.hashtags, function (id) {
          return ReactionCore.Collections.Tags.findOne(id);
        });
      }
    }
  },
  tagsComponent: function () {
    if (ReactionCore.hasPermission("createProduct")) {
      return Template.productTagInputForm;
    }
    return Template.productDetailTags;
  },
  actualPrice: function () {
    const current = selectedVariant();
    if (typeof current === "object") {
      const childVariants = getVariants(current._id);
      if (childVariants.length === 0) {
        return current.price;
      }
      return getProductPriceRange();
    }
  },
  fieldComponent: function () {
    if (ReactionCore.hasPermission("createProduct")) {
      return Template.productDetailEdit;
    }
    return Template.productDetailField;
  },
  metaComponent: function () {
    if (ReactionCore.hasPermission("createProduct")) {
      return Template.productMetaFieldForm;
    }
    return Template.productMetaField;
  }
});

/**
 * productDetail events
 */

Template.productDetail.events({
  "click #price": function () {
    let formName;
    if (ReactionCore.hasPermission("createProduct")) {
      let variant = selectedVariant();
      if (!variant) {
        return;
      }

      if (typeof variant.ancestors[1] === "string") {
        formName = variant.ancestors[1];
      } else {
        formName = variant._id;
      }

      formName = "variant-form-" + formName;
      Session.set(formName, true);
      $(`#${formName}[name="price"]`).focus();
    }
  },
  "click #add-to-cart-quantity": function (event) {
    event.preventDefault();
    return event.stopPropagation();
  },
  "change #add-to-cart-quantity": function (event, template) {
    let currentVariant;
    let qtyField;
    let quantity;
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
    let options;
    let productId;
    let qtyField;
    let quantity;
    let currentVariant = selectedVariant();
    let currentProduct = selectedProduct();

    if (currentVariant) {
      if (currentVariant.ancestors.length === 1) {
        const options = getVariants(currentVariant._id);

        if (options.length > 0) {
          Alerts.add("Please choose options before adding to cart", "danger", {
            placement: "productDetail",
            i18nKey: "productDetail.chooseOptions",
            autoHide: 10000
          });
          return [];
        }
      }

      if (currentVariant.inventoryPolicy && currentVariant.inventoryQuantity < 1) {
        Alerts.add("Sorry, this item is out of stock!", "danger", {
          placement: "productDetail",
          i18nKey: "productDetail.outOfStock",
          autoHide: 10000
        });
        return [];
      }

      qtyField = template.$('input[name="addToCartQty"]');
      quantity = parseInt(qtyField.val(), 10);

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
        productId = currentProduct._id;

        if (productId) {
          Meteor.call("cart/addToCart", productId, currentVariant._id, quantity,
            function (error) {
              if (error) {
                ReactionCore.Log.error("Failed to add to cart.", error);
                return error;
              }
            }
          );
        }

        template.$(".variant-select-option").removeClass("active");
        setCurrentVariant(null);
        qtyField.val(1);
        // scroll to top on cart add
        $("html,body").animate({
          scrollTop: 0
        }, 0);
        // slide out label
        let addToCartText = i18n.t("productDetail.addedToCart");
        let addToCartTitle = currentVariant.title || "";
        $(".cart-alert-text").text(`${quantity} ${addToCartTitle} ${addToCartText}`);
        return $(".cart-alert").toggle("slide", {
          direction: i18n.t("languageDirection") === "rtl" ? "left" : "right",
          width: currentVariant.title.length + 50 + "px"
        }, 600).delay(4000).toggle("slide", {
          direction: i18n.t("languageDirection") === "rtl" ? "left" : "right"
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
    let errorMsg = "";
    const self = this;
    if (!self.title) {
      errorMsg += "Product title is required. ";
      template.$(".title-edit-input").focus();
    }
    const variants = getVariants(self._id);
    for (let variant of variants) {
      let index = _.indexOf(variants, variant);
      if (!variant.title) {
        errorMsg += "Variant " + (index + 1) + " label is required. ";
      }
      if (!variant.price) {
        errorMsg += "Variant " + (index + 1) + " price is required. ";
      }
    }
    if (errorMsg.length > 0) {
      Alerts.add(errorMsg, "danger", {
        placement: "productManagement",
        i18nKey: "productDetail.errorMsg"
      });
    } else {
      Meteor.call("products/publishProduct", self._id, function (error) {
        if (error) {
          return Alerts.add(error.reason, "danger", {
            placement: "productManagement",
            id: self._id,
            i18nKey: "productDetail.errorMsg"
          });
        }
      });
    }
  },
  "click .delete-product-link": function () {
    maybeDeleteProduct(this);
  },
  "click .fa-facebook": function () {
    if (ReactionCore.hasPermission("createProduct")) {
      $(".facebookMsg-edit").fadeIn();
      return $(".facebookMsg-edit-input").focus();
    }
  },
  "click .fa-twitter": function () {
    if (ReactionCore.hasPermission("createProduct")) {
      $(".twitterMsg-edit").fadeIn();
      return $(".twitterMsg-edit-input").focus();
    }
  },
  "click .fa-pinterest": function () {
    if (ReactionCore.hasPermission("createProduct")) {
      $(".pinterestMsg-edit").fadeIn();
      return $(".pinterestMsg-edit-input").focus();
    }
  },
  "click .fa-google-plus": function () {
    if (ReactionCore.hasPermission("createProduct")) {
      $(".googleplusMsg-edit").fadeIn();
      return $(".googleplusMsg-edit-input").focus();
    }
  },
  "focusout .facebookMsg-edit-input,.twitterMsg-edit-input,.pinterestMsg-edit-input,.googleplusMsg-edit": function () {
    Session.set("editing-" + this.field, false);
    return $(".social-media-inputs > *").hide();
  }
});
