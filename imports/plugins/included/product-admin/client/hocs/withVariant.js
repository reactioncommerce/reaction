import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { withRouter } from "react-router";
import { compose } from "recompose";
import { useMutation } from "@apollo/react-hooks";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Catalog, ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import { Countries } from "/client/collections";
import { Reaction, formatPriceString, i18next } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";
import { getVariantIds } from "/lib/selectors/variants";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";

const CREATE_VARIANT = gql`
mutation createProductVariant($input: CreateProductVariantInput!) {
  createProductVariant(input: $input) {
    variant {
      _id
    }
  }
}
`;

const wrapComponent = (Comp) => {
  /**
   * withVariant HOC
   * @param {Object} props Component props
   * @returns {Node} React component
   */
  function WithVariant(props) {
    const [createProductVariant] = useMutation(CREATE_VARIANT);

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
          const [opaqueProductId] = await getOpaqueIds([{ namespace: "Product", id: variantOrParent._id }]);
          const { data, error } = await createProductVariant({ variables: { input: { parentId: opaqueProductId } } });
          if (data) {
            const { createProductVariant: { variant: option } } = data;
            history.push(`/operator/products/${productId}/${variantOrParent._id}/${option._id}`);
            window && window.scrollTo(0, 0);
          }
          if (error) {
            Alerts.alert({
              text: i18next.t("productDetailEdit.addVariantFail", { title: variant.title }),
              confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
            });
          }
        }}
        {...props}
      />
    );
  }

  WithVariant.propTypes = {
    history: PropTypes.object,
    parentVariant: PropTypes.object,
    productId: PropTypes.string,
    variant: PropTypes.object
  };

  return WithVariant;
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
  let variantMedia = [];

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
