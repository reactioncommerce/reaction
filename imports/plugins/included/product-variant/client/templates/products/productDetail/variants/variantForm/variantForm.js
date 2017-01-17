import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { applyProductRevision } from "/lib/api/products";
import { Products } from "/lib/collections";

Template.variantForm.onCreated(function () {
  this.autorun(() => {
    const productHandle = Reaction.Router.getParam("handle");

    if (!productHandle) {
      Reaction.clearActionView();
    }
  });

  this.getVariant = (variant) => {
    const product = Products.findOne(variant._id);
    return applyProductRevision(product);
  };
});

/**
 * variantForm helpers
 */

Template.variantForm.helpers({
  variant() {
    const instance = Template.instance();
    return instance.getVariant(instance.data);
  },
  variantDetails: function () {
    if (this.ancestors.length === 1) {
      return Template.parentVariantForm;
    }
    return Template.childVariantForm;
  },
  childVariants: function () {
    const _id = this._id;
    const variants = ReactionProduct.getVariants();
    const childVariants = [];
    variants.map(variant => {
      if (~variant.ancestors.indexOf(_id) && variant.type !== "inventory") {
        childVariants.push(variant);
      }
    });
    return childVariants;
  },
  hasChildVariants: function () {
    return ReactionProduct.checkChildVariants(this._id) > 0;
  },
  variantFormId: function () {
    return "variant-form-" + this._id;
  },
  variantFormVisible: function () {
    if (!Session.equals("variant-form-" + this._id, true)) {
      return "hidden";
    }
  },
  displayInventoryManagement: function () {
    if (this.inventoryManagement !== true) {
      return "display:none;";
    }
  },
  displayLowInventoryWarning: function () {
    if (this.inventoryManagement !== true) {
      return "display:none;";
    }
  },
  removeVariant(variant) {
    return () => {
      return () => {
        const title = variant.title || i18next.t("productDetailEdit.thisVariant");

        Alerts.alert({
          title: i18next.t("productDetailEdit.archiveVariantConfirm", { title }),
          showCancelButton: true,
          confirmButtonText: "Archive"
        }, (isConfirm) => {
          if (isConfirm) {
            const id = variant._id;
            Meteor.call("products/deleteVariant", id, function (error, result) {
              if (result && ReactionProduct.selectedVariantId() === id) {
                return ReactionProduct.setCurrentVariant(null);
              }
            });
          }
        });
      };
    };
  },
  restoreVariant(variant) {
    return () => {
      return () => {
        const title = variant.title || i18next.t("productDetailEdit.thisVariant");

        Alerts.alert({
          title: i18next.t("productDetailEdit.restoreVariantConfirm", { title }),
          showCancelButton: true,
          confirmButtonText: "Restore"
        }, (isConfirm) => {
          if (isConfirm) {
            const id = variant._id;
            Meteor.call("products/updateProductField", id, "isDeleted", false);
          }
        });
      };
    };
  }
});

/**
 * variantForm events
 */

Template.variantForm.events({
  "change form :input": function (event, template) {
    const field = $(event.currentTarget).attr("name");
    //
    // this should really move into a method
    //
    if (field === "taxable" || field === "inventoryManagement" || field === "inventoryPolicy") {
      const value = $(event.currentTarget).prop("checked");
      if (ReactionProduct.checkChildVariants(template.data._id) > 0) {
        const childVariants = ReactionProduct.getVariants(template.data._id);
        for (const child of childVariants) {
          Meteor.call("products/updateProductField", child._id, field, value,
            error => {
              if (error) {
                throw new Meteor.Error("error updating variant", error);
              }
            });
        }
      }
    }
    // template.$(formId).submit();
    // ReactionProduct.setCurrentVariant(template.data._id);
  },
  "click .btn-child-variant-form": function (event, template) {
    event.stopPropagation();
    event.preventDefault();
    const productId = ReactionProduct.selectedProductId();
    if (!productId) {
      return;
    }
    Meteor.call("products/createVariant", template.data._id);
  },
  "click .btn-clone-variant": function (event, template) {
    event.stopPropagation();
    event.preventDefault();
    const productId = ReactionProduct.selectedProductId();
    if (!productId) {
      return;
    }
    Meteor.call("products/cloneVariant", productId, template.data._id,
      function (error, result) {
        if (result) {
          const variantId = result[0];

          ReactionProduct.setCurrentVariant(variantId);
          Session.set("variant-form-" + variantId, true);
        }
      });
  }
});
