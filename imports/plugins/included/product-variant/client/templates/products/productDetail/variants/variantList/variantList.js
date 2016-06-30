import { Reaction, i18next } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Products, Media } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

/**
 * variantList helpers
 */
Template.variantList.helpers({
  media: function () {
    const media = Media.findOne({
      "metadata.variantId": this._id
    }, {
      sort: {
        "metadata.priority": 1
      }
    });

    return media instanceof FS.File ? media : false;
  },
  variants: function () {
    let inventoryTotal = 0;
    const variants = ReactionProduct.getTopVariants();
    if (variants.length) {
      // calculate inventory total for all variants
      for (let variant of variants) {
        if (variant.inventoryManagement) {
          let qty = ReactionProduct.getVariantQuantity(variant);
          if (typeof qty === "number") {
            inventoryTotal += qty;
          }
        }
      }
      // calculate percentage of total inventory of this product
      for (let variant of variants) {
        let qty = ReactionProduct.getVariantQuantity(variant);
        variant.inventoryTotal = inventoryTotal;
        if (variant.inventoryManagement && inventoryTotal) {
          variant.inventoryPercentage = parseInt(qty / inventoryTotal * 100, 10);
        } else {
          // for cases when sellers doesn't use inventory we should always show
          // "green" progress bar
          variant.inventoryPercentage = 100;
        }
        if (variant.title) {
          variant.inventoryWidth = parseInt(variant.inventoryPercentage -
            variant.title.length, 10);
        } else {
          variant.inventoryWidth = 0;
        }
      }
      // sort variants in correct order
      variants.sort((a, b) => a.index - b.index);

      return variants;
    }
    return [];
  },
  childVariants: function () {
    const childVariants = [];
    const variants = ReactionProduct.getVariants();
    if (variants.length > 0) {
      const current = ReactionProduct.selectedVariant();

      if (!current) {
        return [];
      }

      if (current.ancestors.length === 1) {
        variants.map(variant => {
          if (typeof variant.ancestors[1] === "string" &&
            variant.ancestors[1] === current._id &&
            variant.optionTitle &&
            variant.type !== "inventory") {
            childVariants.push(variant);
          }
        });
      } else {
        // TODO not sure we need this part...
        variants.map(variant => {
          if (typeof variant.ancestors[1] === "string" &&
            variant.ancestors.length === current.ancestors.length &&
            variant.ancestors[1] === current.ancestors[1] &&
            variant.optionTitle
          ) {
            childVariants.push(variant);
          }
        });
      }

      return childVariants;
    }

    return null;
  },
  selectedVariant() {
    const _id = this._id;
    const current = ReactionProduct.selectedVariant();
    if (typeof current === "object" && (_id === current._id || ~current.ancestors.indexOf(this._id))) {
      return "variant-detail-selected";
    }

    return null;
  }
});

/**
 * variantList events
 */

Template.variantList.events({
  "click #create-variant": function () {
    return Meteor.call("products/createVariant", this._id);
  },
  "click .variant-select-option": function (event, template) {
    template.$(".variant-select-option").removeClass("active");
    $(event.target).addClass("active");
    Alerts.removeSeen();

    const selectedProduct = ReactionProduct.selectedProduct();
    Reaction.Router.go("product", {handle: selectedProduct.handle, variantId: this._id});

    return ReactionProduct.setCurrentVariant(this._id);
  },
  "click .variant-select-option .variant-edit": function () {
    const variant = this;
    const parentVariant = Products.findOne(variant.ancestors[1]);

    ReactionProduct.setCurrentVariant(variant._id);
    Session.set("variant-form-" + parentVariant._id, true);

    if (Reaction.hasPermission("createProduct")) {
      Reaction.showActionView({
        label: "Edit Variant",
        i18nKeyLabel: "productDetailEdit.editVariant",
        template: "variantForm",
        data: parentVariant
      });
    }
  }
});
