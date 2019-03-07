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
 * @returns {Promise} A promise that resolved to and object of shape `{ newVariantId }`
 */
export async function handleCreateOption(variant) {
  const promiseResult = await new Promise((resolve, reject) => {
    Meteor.call("products/createVariant", variant._id, (error, result) => {
      if (error) {
        Alerts.alert({
          text: i18next.t("productDetailEdit.addVariantFail", { title: variant.title }),
          confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
        });
        reject(error);
      } else if (result) {
        resolve({ newVariantId: result });
      }
    });
  });

  return promiseResult;
}

const wrapComponent = (Comp) => {
  /**
   * withVariant HOC
   * @param {Object} props Component props
   * @return {Node} React component
   */
  function withVariant(props) {
    const { history, product } = props;

    return (
      <Comp
        onCreateOption={async (parentVariant) => {
          const { newVariantId } = handleCreateOption(parentVariant);
          history.push(`/operator/products/${product._id}/${parentVariant._id}/${newVariantId}`);
          window && window.scrollTo(0, 0);
        }}
        {...props}
      />
    );
  }

  withVariant.propTypes = {
    history: PropTypes.object,
    product: PropTypes.object
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
  const { handle: productId, variantId, optionId } = props.match.params;

  // Get the top-level variant
  const variant = Products.findOne({
    _id: variantId
  });

  // Get the current variant or option;
  let option;
  let optionMedia = [];

  if (optionId) {
    option = Products.findOne({
      _id: optionId
    });
  }

  let options = ReactionProduct.getVariants(variantId);

  if (options) {
    if (Array.isArray(options)) {
      optionMedia = Media.findLocal(
        {
          "metadata.variantId": {
            $in: getVariantIds(options)
          }
        },
        {
          sort: {
            "metadata.priority": 1
          }
        }
      );
    }

    options = options.map((optionData) => ({
      ...optionData,
      displayPrice: formatPriceString(Catalog.getVariantPriceRange(optionData._id)),
      media: optionMedia && optionMedia.filter((media) => (
        media.metadata.variantId === optionData._id
      ))
    }));
  }

  onData(null, {
    countries: Countries.find({}).fetch(),
    editFocus: Reaction.state.get("edit/focus"),
    options,
    variant,
    option,
    optionMedia,
    productId,
    variantId,
    optionId
  });
}

export default compose(
  withRouter,
  composeWithTracker(composer),
  wrapComponent
);
