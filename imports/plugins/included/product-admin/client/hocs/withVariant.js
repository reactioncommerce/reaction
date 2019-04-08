import React from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { withRouter } from "react-router";
import { Meteor } from "meteor/meteor";
import { Catalog, ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import { Countries } from "/client/collections";
import { Reaction, formatPriceString, i18next } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";
import { getVariantIds } from "/lib/selectors/variants";

/**
 * Create a new option from a supplied variant
 * @param {Object} variant Variant object
 * @returns {Promise} A promise that resolves to and object of shape `{ newVariantId }`
 */
export function handleCreateOption(variant) {
  return new Promise((resolve, reject) => {
    Meteor.call("products/createVariant", variant._id, (error, result) => {
      if (error) {
        Alerts.alert({
          text: i18next.t("productDetailEdit.addVariantFail", { title: variant.title }),
          confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
        });
        reject(error);
      }
      resolve({ newVariantId: result });
    });
  });
}

const wrapComponent = (Comp) => {
  /**
   * withVariant HOC
   * @param {Object} props Component props
   * @return {Node} React component
   */
  function withVariant(props) {
    const {
      history,
      productId,
      parentVariant,
      variant
    } = props;

    const variantOrParent = parentVariant || variant;

    return (
      <Comp
        onCreateOption={async () => {
          const { newVariantId } = await handleCreateOption(variantOrParent);
          history.push(`/operator/products/${productId}/${variantOrParent._id}/${newVariantId}`);
          window && window.scrollTo(0, 0);
        }}
        {...props}
      />
    );
  }

  withVariant.propTypes = {
    history: PropTypes.object,
    parentVariant: PropTypes.object,
    productId: PropTypes.string,
    variant: PropTypes.object
  };

  return withVariant;
};

/**
 * Composer function to fetch variants and options
 * @param {Object} props Props
 * @param {Function} onData Data callback
 * @returns {undefined} no return
 */
function composer(props, onData) {
  const {
    handle: productId,
    parentVariantId,
    variantId
  } = props.match.params;

  // Get the current level variant
  const variant = Products.findOne({
    _id: variantId
  });

  // Get the current variant or option;
  let parentVariant;
  let childVariants;
  let childVariantMedia = [];

  // Get the parent variant
  if (parentVariantId) {
    parentVariant = Products.findOne({
      _id: parentVariantId
    });
  }

  let variants;

  if (parentVariantId) {
    variants = ReactionProduct.getVariants(parentVariantId);
  } else {
    variants = ReactionProduct.getTopVariants();
  }
  let variantMedia: [];

  if (variants) {
    if (Array.isArray(variants)) {
      variantMedia = Media.findLocal(
        {
          "metadata.variantId": {
            $in: getVariantIds(variants)
          }
        },
        {
          sort: {
            "metadata.priority": 1
          }
        }
      );
    }

    variants = variants.map((variantData) => ({
      ...variantData,
      displayPrice: formatPriceString(Catalog.getVariantPriceRange(variantData._id)),
      media: variantMedia && variantMedia.filter((media) => (
        media.metadata.variantId === variantData._id
      ))
    }));
  }

  childVariants = ReactionProduct.getVariants(variantId);

  if (childVariants) {
    if (Array.isArray(childVariants)) {
      childVariantMedia = Media.findLocal(
        {
          "metadata.variantId": {
            $in: getVariantIds(childVariants)
          }
        },
        {
          sort: {
            "metadata.priority": 1
          }
        }
      );
    }

    childVariants = childVariants.map((optionData) => ({
      ...optionData,
      displayPrice: formatPriceString(Catalog.getVariantPriceRange(optionData._id)),
      media: childVariantMedia && childVariantMedia.filter((media) => (
        media.metadata.variantId === optionData._id
      ))
    }));
  }

  onData(null, {
    countries: Countries.find({}).fetch(),
    editFocus: Reaction.state.get("edit/focus"),
    isAtMaxDepth: variant && variant.ancestors.length === 2,
    productId,

    // Current variant
    variantId,
    variant,
    variants,
    variantMedia,

    // Parent variant
    parentVariant,
    parentVariantId,

    // Child variants
    childVariants,
    childVariantMedia
  });
}

export default compose(
  withRouter,
  composeWithTracker(composer),
  wrapComponent
);
