import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";

import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Tags, Media } from "/lib/collections";
import { ProductDetail, VariantList } from "../components";
import SocialContainer from "./socialContainer";

class ProductDetailContainer extends Component {
  render() {
    console.log(this.props);
    return (
      <ProductDetail
        socialComponent={<SocialContainer />}
        topVariantComponent={
          <VariantList varaints={this.props.topVariants} />
        }
        {...this.props}
      />
    );
  }
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

function composer(props, onData) {
  const tagSub = Meteor.subscribe("Tags");
  let productSub;
  const productId = Reaction.Router.getParam("handle");
  const variantId = Reaction.Router.getParam("variantId");
  const topVariants = getTopVariants()




  // console.log(productId);
  // console.log(variantId);

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
      let variant = ReactionProduct.selectedVariant();

      if (variant) {
        mediaArray = Media.find({
          "metadata.variantId": variant._id
        }, {
          sort: {
            "metadata.priority": 1
          }
        });
      }

      const current = variant
      let priceRange;
      if (typeof current === "object") {
        const childVariants = ReactionProduct.getVariants(current._id);
        // when top variant has no child variants we display only its price
        if (childVariants.length === 0) {
          return current.price;
        }
        // otherwise we want to show child variants price range
        priceRange = ReactionProduct.getVariantPriceRange();
      }

      onData(null, {
        product,
        priceRange,
        tags,
        media: mediaArray.fetch(),
        topVariants,
        childVariants: []
      });
    }
  }


}

export default composeWithTracker(composer)(ProductDetailContainer);
