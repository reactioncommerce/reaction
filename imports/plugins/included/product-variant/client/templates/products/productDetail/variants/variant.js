import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { EditButton, VisibilityButton } from "/imports/plugins/core/ui/client/components";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

// Duplicated in variantList/variantList.js
function variantIsSelected(variantId) {
  const current = ReactionProduct.selectedVariant();
  if (typeof current === "object" && (variantId === current._id || ~current.ancestors.indexOf(variantId))) {
    return true;
  }

  return false;
}

function variantIsInActionView(variantId) {
  const actionViewVariant = Reaction.getActionView().data;

  if (actionViewVariant) {
    // Check if the variant is selected, and also visible & selected in the action view
    return variantIsSelected(variantId) && variantIsSelected(actionViewVariant._id) && Reaction.isActionViewOpen();
  }

  return false;
}


/**
 * variant helpers
 */

Template.variant.helpers({
  progressBar: function () {
    if (this.inventoryPercentage <= 10) {
      return "progress-bar-danger";
    } else if (this.inventoryPercentage <= 30) {
      return "progress-bar-warning";
    }
    return "progress-bar-success";
  },
  selectedVariant: function () {
    if (variantIsSelected(this._id)) {
      return "variant-detail-selected";
    }

    return null;
  },
  displayQuantity: function () {
    return ReactionProduct.getVariantQuantity(this);
  },
  displayPrice: function () {
    return ReactionProduct.getVariantPriceRange(this._id);
  },
  isSoldOut: function () {
    return ReactionProduct.getVariantQuantity(this) < 1;
  },
  EditButton() {
    const data = Template.currentData();

    return {
      component: EditButton,
      toggleOn: variantIsInActionView(data._id),
      onClick() {
        showVariant(data);
      }
    };
  },
  VariantRevisionButton() {
    const variant = Template.currentData();

    return {
      component: VisibilityButton,
      toggleOn: variant.isVisible,
      onClick(event) {
        event.stopPropagation();
        ReactionProduct.toggleVisibility(variant);
      }
    };
  }
});

/**
 * variant events
 */

function showVariant(variant) {
  const selectedProduct = ReactionProduct.selectedProduct();

  ReactionProduct.setCurrentVariant(variant._id);
  Session.set("variant-form-" + variant._id, true);
  Reaction.Router.go("product", {handle: selectedProduct.handle, variantId: variant._id});

  if (Reaction.hasPermission("createProduct")) {
    Reaction.showActionView({
      label: "Edit Variant",
      i18nKeyLabel: "productDetailEdit.editVariant",
      template: "variantForm",
      data: variant
    });
  }
}

Template.variant.events({
  "click .variant-edit": function () {
    showVariant(this);
  },
  "dblclick .variant-detail": function () {
    showVariant(this);
  },
  "click .variant-detail": function () {
    Alerts.removeSeen();

    ReactionProduct.setCurrentVariant(this._id);
  }
});
