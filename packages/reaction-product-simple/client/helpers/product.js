
ReactionSimpleProduct = {

  removeTag(productId, tagId) {
    Meteor.call("products/removeProductTag", productId, tagId);
  },

  createTag(productId, tagName) {
    return this.updateTag(productId, tagName, null);
  },

  updateTag(productId, tagName, tagId) {
    let val = $(event.currentTarget).val();
    if (tagName) {
      return Meteor.call("products/updateProductTags", productId, tagName, tagId,
        function (error) {
          // template.$(".tags-submit-new").val("").focus();
          if (error) {
            Alerts.add("Tag already exists, or is empty.",
              "danger", {
                autoHide: true
              });
            return false;
          }
        });
    }
  },


  updateProduct(productId, field, value) {
    Meteor.call("products/updateProductField", productId, field, value,
      function (error) {
        if (error) {
          return Alerts.add(error.reason, "danger", {
            placement: "productManagement",
            i18nKey: "productDetail.errorMsg",
            id: this._id
          });
        }
        //
        if (self.field === 'title') {
          Meteor.call("products/setHandle", productId, function (error, result) {
            if (result) {
              return Router.go("product", {
                _id: result
              });
            }
          });
        }
        // animate updated field
        // return $(event.currentTarget).animate({
        //   backgroundColor: "#e2f2e2"
        // }).animate({
        //   backgroundColor: "#fff"
        // });
      });
  },







  tags() {
    let product = selectedProduct();
    if (product) {
      if (product.hashtags) {
        return _.map(product.hashtags, function (id) {
          console.log("ID", id);
          return ReactionCore.Collections.Tags.findOne(id);
        });
      }
    }
  },

  get variants() {
    let inventoryTotal = 0;
    const variants = [];
    const product = selectedProduct();

    if (product) {
      // top level variants
      for (let variant of product.variants) {
        if (!variant.parentId) {
          variants.push(variant);
        }
      }
      // calculate inventory total for all variants
      for (let variant of variants) {
        if (!isNaN(variant.inventoryQuantity)) {
          inventoryTotal += variant.inventoryQuantity;
        }


        variant.displayPrice = ReactionCore.Currency.formatPriceRange(getVariantPriceRange(variant._id));
      }
      // calculate percentage of total inventory of this product
      for (let variant of variants) {
        variant.inventoryTotal = inventoryTotal;
        variant.inventoryPercentage = parseInt(variant.inventoryQuantity /
          inventoryTotal * 100, 10);
        if (variant.title) {
          variant.inventoryWidth = parseInt(variant.inventoryPercentage -
            variant.title.length, 10);
        } else {
          variant.inventoryWidth = 0;
        }
      }
      return variants;
    }
  },

  get childVariants() {
    const variants = [];
    const product = selectedProduct();

    if (product) {
      let current = selectedVariant();
      if (current !== null ? current._id : void 0) {
        if (current.parentId) {
          for (let variant of product.variants) {
            if (variant.parentId === current.parentId && variant.optionTitle &&
              variant.type !== "inventory") {
              variants.push(variant);
            }
          }
        } else {
          for (let variant of product.variants) {
            if (variant.parentId === current._id && variant.optionTitle &&
              variant.type !== "inventory") {
              variants.push(variant);
            }
          }
        }
      }
      return variants;
    }
  }
}
