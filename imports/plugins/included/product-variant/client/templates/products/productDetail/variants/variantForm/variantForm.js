import { Meteor } from "meteor/meteor";
import { ReactiveDict } from "meteor/reactive-dict";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { applyProductRevision } from "/lib/api/products";
import { Products } from "/lib/collections";
import VariantFormContainer from "../../../../../containers/variantFormContainer";

Template.variantForm.onCreated(function () {
  this.state = new ReactiveDict();

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
  variantFormComponent() {
    return VariantFormContainer;
  },
  variant() {
    const instance = Template.instance();
    return instance.getVariant(instance.data);
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
  variantFormId: function () {
    return "variant-form-" + this._id;
  }
});

/**
 * variantForm events
 */

Template.variantForm.events({
  "click .btn-child-variant-form": function (event, template) {
    event.stopPropagation();
    event.preventDefault();
    const productId = ReactionProduct.selectedProductId();

    if (!productId) {
      return;
    }

    Meteor.call("products/createVariant", template.data._id, function (error, result) {
      if (error) {
        Alerts.alert({
          text: i18next.t("productDetailEdit.addVariantFail", { title: template.data.title }),
          confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
        });
      } else if (result) {
        const newVariantId = result;
        const selectedProduct = ReactionProduct.selectedProduct();
        const handle = selectedProduct.__published && selectedProduct.__published.handle || selectedProduct.handle;
        ReactionProduct.setCurrentVariant(newVariantId);
        Session.set("variant-form-" + newVariantId, true);

        Reaction.Router.go("product", {
          handle: handle,
          variantId: newVariantId
        });
      }
    });
  }
});
