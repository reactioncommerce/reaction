import { Meteor } from "meteor/meteor";
import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";

import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Tags, Media } from "/lib/collections";
import { ProductDetail } from "../components";
import { SocialContainer, VariantListContainer } from "./";
import { Translatable } from "/imports/plugins/core/ui/client/providers";
import TranslationProvider from "/imports/plugins/core/ui/client/providers/translationProvider"

class ProductDetailContainer extends Component {
  render() {
    return (
      <TranslationProvider>
        <ProductDetail
          socialComponent={<SocialContainer />}
          topVariantComponent={<VariantListContainer />}
          {...this.props}
        />
      </TranslationProvider>
    );
  }
}

function composer(props, onData) {
  const tagSub = Meteor.subscribe("Tags");
  const productId = Reaction.Router.getParam("handle");
  const variantId = Reaction.Router.getParam("variantId");
  let productSub;

  if (productId) {
    productSub = Meteor.subscribe("Product", variantId);
  }

  if (productSub && productSub.ready() && tagSub.ready()) {
    // Get the product
    const product = ReactionProduct.setProduct(productId, variantId);
    // this.state.set("product", product);

    if (Reaction.hasPermission("createProduct")) {
      if (!Reaction.getActionView() && Reaction.isActionViewOpen() === true) {
        Reaction.setActionView({
          template: "productDetailForm",
          data: product
        });
      }
    }

    // Get the product tags
    if (product) {
      let tags;
      if (_.isArray(product.hashtags)) {
        tags = _.map(product.hashtags, function (id) {
          return Tags.findOne(id);
        });
      }

      let mediaArray = [];
      let selectedVariant = ReactionProduct.selectedVariant();

      if (selectedVariant) {
        mediaArray = Media.find({
          "metadata.variantId": selectedVariant._id
        }, {
          sort: {
            "metadata.priority": 1
          }
        });
      }

      let priceRange;
      if (typeof selectedVariant === "object") {
        const childVariants = ReactionProduct.getVariants(selectedVariant._id);
        // when top variant has no child variants we display only its price
        if (childVariants.length === 0) {
          priceRange = selectedVariant.price;
        }
        // otherwise we want to show child variants price range
        priceRange = ReactionProduct.getVariantPriceRange();
      }

      onData(null, {
        product,
        priceRange,
        tags,
        media: mediaArray.fetch(),
        handleProductFieldChange(productId, fieldName, value) {
          Meteor.call("products/updateProductField", productId, fieldName, value);
        }
      });
    }
  }
}

// Decorate component and export
let decoratedComponent;
decoratedComponent = composeWithTracker(composer)(ProductDetailContainer);

export default decoratedComponent;
