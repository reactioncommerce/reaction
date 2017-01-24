import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Tags, Media } from "/lib/collections";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { ProductDetail } from "../components";
import { SocialContainer, VariantListContainer } from "./";
import { MediaGalleryContainer } from "/imports/plugins/core/ui/client/containers";
import { DragDropProvider, TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import { StyleRoot } from "radium";


const handleProductFieldChange = (productId, fieldName, value) => {
  Meteor.call("products/updateProductField", productId, fieldName, value);
};

const handleViewContextChange = (event, value) => {
  Reaction.setUserPreferences("reaction-dashboard", "viewAs", value);
};

const handleDeleteProduct = (product) => {
  ReactionProduct.maybeDeleteProduct(product);
};

function composer(props, onData) {
  const productId = Reaction.Router.getParam("handle");
  const variantId = Reaction.Router.getParam("variantId");
  const revisionType = Reaction.Router.getQueryParam("revision");
  const viewProductAs = Reaction.getUserPreferences("reaction-dashboard", "viewAs", "administrator");

  let productSub;

  if (productId) {
    productSub = Meteor.subscribe("Product", productId);
  }

  if (productSub && productSub.ready()) {
    // Get the product
    const product = ReactionProduct.setProduct(productId, variantId);

    let editable;

    if (viewProductAs === "customer") {
      editable = false;
    } else {
      editable = Reaction.hasPermission(["createProduct"]);
    }

    // Get the product tags
    if (product) {
      onData(null, {
        product: product,
        editable,
        viewAs: viewProductAs,
        hasAdminPermission: Reaction.hasPermission(["createProduct"]),
        onDeleteProduct: handleDeleteProduct,
        onProductFieldChange: handleProductFieldChange,
        onViewContextChange: handleViewContextChange
      });
    }
  }
}

// Decorate component and export
export default function productToolbarContainer(Comp) {
  function CompositeComponent(props) {
    return (
      <TranslationProvider>
        <Comp {...props} />
      </TranslationProvider>
    );
  }

  return composeWithTracker(composer, Loading)(CompositeComponent);
}
