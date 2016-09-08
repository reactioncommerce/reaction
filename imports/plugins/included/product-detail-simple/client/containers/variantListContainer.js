import React, { Component } from "react";
import { composeWithTracker } from "react-komposer";
import { ReactionProduct } from "/lib/api";
import { Reaction } from "/client/api";
import { VariantList } from "../components";
import { getChildVariants } from "../selectors/variants";
import { Products } from "/lib/collections";

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

function getTopVariants() {
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
}

function displayQuantity(variant) {
  return ReactionProduct.getVariantQuantity(variant);
}

function isSoldOut(variant) {
  return ReactionProduct.getVariantQuantity(variant) < 1;
}

class VariantListContainer extends Component {

  handleVariantClick = (event, variant) => {
    const selectedProduct = ReactionProduct.selectedProduct();

    ReactionProduct.setCurrentVariant(variant._id);
    Session.set("variant-form-" + variant._id, true);
    Reaction.Router.go("product", {handle: selectedProduct.handle, variantId: variant._id});
  }

  handleEditVariant = (event, variant, ancestors = -1) => {
    const selectedProduct = ReactionProduct.selectedProduct();
    let editVariant = variant;
    if (ancestors >= 0) {
      editVariant = Products.findOne(variant.ancestors[ancestors]);
    }

    ReactionProduct.setCurrentVariant(variant._id);
    Session.set("variant-form-" + editVariant._id, true);
    Reaction.Router.go("product", {handle: selectedProduct.handle, variantId: editVariant._id});

    if (Reaction.hasPermission("createProduct")) {
      Reaction.showActionView({
        label: "Edit Variant",
        i18nKeyLabel: "productDetailEdit.editVariant",
        template: "variantForm",
        data: editVariant
      });
    }
  }

  render() {
    return (
      <VariantList
        onEditVariant={this.handleEditVariant}
        onVariantClick={this.handleVariantClick}
        {...this.props}
      />
    );
  }
}

function composer(props, onData) {
  onData(null, {
    variants: getTopVariants(),
    variantIsSelected,
    variantIsInActionView,
    childVariants: getChildVariants(),
    displayPrice: ReactionProduct.getVariantPriceRange,
    isSoldOut: isSoldOut
  });
}

export default composeWithTracker(composer)(VariantListContainer);
