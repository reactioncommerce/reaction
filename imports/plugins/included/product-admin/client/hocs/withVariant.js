import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { compose } from "recompose";
import { useMutation } from "@apollo/react-hooks";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import ReactionError from "@reactioncommerce/reaction-error";
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
      parentVariant,
      variant
    } = props;

    const variantOrParent = parentVariant || variant;

    return (
      <Comp
        onCreateOption={async () => {
          const [opaqueProductId, opaqueShopId] = await getOpaqueIds([
            { namespace: "Product", id: variantOrParent._id },
            { namespace: "Shop", id: variantOrParent.shopId }
          ]);

          try {
            await createProductVariant({ variables: { input: { productId: opaqueProductId, shopId: opaqueShopId } } });
            // Because of the way GraphQL and meteor interact when creating a new variant,
            // we can't immediately redirect a user to the new variant as GraphQL is too quick
            // and the meteor subscription isn't yet updated. Once this page has been updated
            // to use GraphQL for data fetching, add a redirect to the new variant when it's created
            Alerts.toast(i18next.t("productDetailEdit.addVariant"), "success");
          } catch (error) {
            Alerts.toast(i18next.t("productDetailEdit.addVariantFail", { err: error }), "error");
            throw new ReactionError("server-error", "Unable to create variant");
          }
        }}
        {...props}
      />
    );
  }

  WithVariant.propTypes = {
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
  composeWithTracker(composer),
  wrapComponent
);
