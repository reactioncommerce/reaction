import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import _ from "lodash";
import { withRouter } from "react-router";
import { compose, withState } from "recompose";
import { useMutation } from "@apollo/react-hooks";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Media } from "/imports/plugins/core/files/client";
import { Meteor } from "meteor/meteor";
import { Reaction, formatPriceString, i18next } from "/client/api";
import { getPrimaryMediaForItem, ReactionProduct, Catalog } from "/lib/api";
import { Tags, Templates } from "/lib/collections";
import { Countries } from "/client/collections";
import { getVariantIds } from "/lib/selectors/variants";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";

const ARCHIVE_PRODUCTS = gql`
  mutation archiveProducts($input: ArchiveProductsInput!) {
    archiveProducts(input: $input) {
      products {
        _id
      }
    }
  }
`;

const CLONE_PRODUCTS = gql`
  mutation cloneProducts($input: CloneProductsInput!) {
    cloneProducts(input: $input) {
      products {
        _id
      }
    }
  }
`;

const CREATE_VARIANT = gql`
mutation createProductVariant($input: CreateProductVariantInput!) {
  createProductVariant(input: $input) {
    variant {
      _id
    }
  }
}
`;

/**
 * Metafield to remove
 * @param {String} productId Product ID
 * @param {Object} metafield Metafield object
 * @param {String} metafield.key Key
 * @param {String} metafield.value Value
 * @returns {undefined} No return
 */
export function handleMetaRemove(productId, metafield) {
  Meteor.call("products/removeMetaFields", productId, metafield);
}

/**
 * Restore an archived product
 * @param {Object} product Product object
 * @returns {undefined} No return
 */
export function handleProductRestore(product) {
  Meteor.call("products/updateProductField", product._id, "isDeleted", false);
}

/**
 * Save a product field
 * @param {String} productId Product ID
 * @param {String} fieldName Field name to save
 * @param {Any} value Value for that field
 * @returns {undefined} No return
 */
export function handleProductFieldSave(productId, fieldName, value) {
  Meteor.call("products/updateProductField", productId, fieldName, value, (error) => {
    if (error) {
      Alerts.toast(error.message, "error");
      this.forceUpdate();
    }
  });
}

/**
 * Handle save of a product variant field
 * @param {String} variantId Variant id
 * @param {String} fieldName Field name
 * @param {Any} value Any value supported by the variant schema
 * @returns {undefined} No return
 */
export function handleProductVariantFieldSave(variantId, fieldName, value) {
  Meteor.call("products/updateProductField", variantId, fieldName, value, (error) => {
    if (error) {
      Alerts.toast(error.message, "error");
    }
  });
}


/**
 * Toggle product visibility
 * @param {String} product Product
 * @returns {undefined} No return
 */
function handleToggleProductVisibility(product) {
  Meteor.call("products/updateProductField", product._id, "isVisible", !product.isVisible);
}

const wrapComponent = (Comp) => {
  /**
   * withProduct HOC
   * @param {Object} props Component props
   * @returns {Node} React component
   */
  function WithProduct(props) {
    const { history } = props;
    const [archiveProducts] = useMutation(ARCHIVE_PRODUCTS);
    const [cloneProducts] = useMutation(CLONE_PRODUCTS);
    const [createProductVariant] = useMutation(CREATE_VARIANT);

    return (
      <Comp
        onArchiveProduct={async (product, redirectUrl) => {
          const opaqueProductIds = await getOpaqueIds([{ namespace: "Product", id: product._id }]);
          const [opaqueShopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);

          try {
            await archiveProducts({ variables: { input: { shopId: opaqueShopId, productIds: opaqueProductIds } } });
            Alerts.toast(i18next.t("productDetailEdit.archiveProductsSuccess"), "success");
            history.push(redirectUrl);
          } catch (error) {
            Alerts.toast(i18next.t("productDetailEdit.archiveProductsFail", { err: error }), "error");
          }
        }}
        onCloneProduct={async (product) => {
          const opaqueProductIds = await getOpaqueIds([{ namespace: "Product", id: product }]);
          const [opaqueShopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);

          try {
            await cloneProducts({ variables: { input: { shopId: opaqueShopId, productIds: opaqueProductIds } } });
            Alerts.toast(i18next.t("productDetailEdit.cloneProductSuccess"), "success");
          } catch (error) {
            Alerts.toast(i18next.t("productDetailEdit.cloneProductFail", { err: error }), "error");
          }
        }}
        onCreateVariant={async (product) => {
          const [opaqueProductId, opaqueShopId] = await getOpaqueIds([
            { namespace: "Product", id: product._id },
            { namespace: "Shop", id: product.shopId }
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
          }
        }}
        onProductFieldSave={handleProductFieldSave}
        onProductVariantFieldSave={handleProductVariantFieldSave}
        onRestoreProduct={handleProductRestore}
        onToggleProductVisibility={handleToggleProductVisibility}
        {...props}
      />
    );
  }

  WithProduct.propTypes = {
    history: PropTypes.object,
    newMetafield: PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    }),
    setNewMetaField: PropTypes.func
  };

  return WithProduct;
};

/**
 * Get top level variants
 * @returns {Array<Object>} Array of variant objects
 */
function getTopVariants() {
  let inventoryTotal = 0;
  const variants = ReactionProduct.getTopVariants();
  if (variants.length) {
    // calculate inventory total for all variants
    for (const variant of variants) {
      if (variant.inventoryManagement) {
        const qty = variant.inventoryAvailableToSell;
        if (typeof qty === "number") {
          inventoryTotal += qty;
        }
      }
    }
    // calculate percentage of total inventory of this product
    for (const variant of variants) {
      const qty = variant.inventoryAvailableToSell;
      variant.inventoryTotal = inventoryTotal;
      if (variant.inventoryManagement && inventoryTotal) {
        variant.inventoryPercentage = parseInt(qty / inventoryTotal * 100, 10);
      } else {
        // for cases when sellers doesn't use inventory we should always show
        // "green" progress bar
        variant.inventoryPercentage = 100;
      }
      if (variant.title) {
        variant.inventoryWidth = parseInt(variant.inventoryPercentage - variant.title.length, 10);
      } else {
        variant.inventoryWidth = 0;
      }
    }
    // sort variants in correct order
    variants.sort((variantA, variantB) => variantA.index - variantB.index);

    return variants;
  }
  return [];
}

/**
 * Composer function for product and variant data
 * @param {Object} props Component props to compose
 * @param {onData} onData Data callback
 * @returns {undefined} No return
 */
function composer(props, onData) {
  const { handle: productId, variantId } = props.match.params;
  const editable = Reaction.hasAdminAccess();

  let product;
  let productSub;
  if (productId) {
    productSub = Meteor.subscribe("Product", productId);
    Meteor.subscribe("ProductMedia", productId);
  }

  if (productSub && productSub.ready()) {
    product = ReactionProduct.setProduct(productId, variantId);
    product && Meteor.subscribe("Tags", product.hashtags);

    if (variantId) {
      ReactionProduct.setCurrentVariant(variantId);
    }
  }

  let tags;
  let media;

  if (product) {
    if (_.isArray(product.hashtags)) {
      tags = Tags.find({ _id: { $in: product.hashtags } }).fetch();
    }

    const selectedVariant = ReactionProduct.selectedVariant();

    if (selectedVariant) {
      media = getPrimaryMediaForItem({
        productId: product._id,
        variantId: selectedVariant._id
      });
    }

    const templates = Templates.find({
      parser: "react",
      provides: "template",
      templateFor: { $in: ["pdp"] },
      enabled: true
    }).map((template) => ({
      label: template.title,
      value: template.name
    }));

    const countries = Countries.find({}).fetch();

    let variants = getTopVariants();

    if (variants) {
      const variantMedia = Media.findLocal(
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

      variants = variants.map((variantData) => ({
        ...variantData,
        displayPrice: formatPriceString(Catalog.getVariantPriceRange(variantData._id)),
        media: variantMedia && variantMedia.filter((variantMediaItem) => (
          variantMediaItem.metadata.variantId === variantData._id
        ))
      }));
    }

    onData(null, {
      editFocus: Reaction.state.get("edit/focus") || "productDetails",
      product,
      media,
      tags,
      templates,
      countries,
      editable,
      variants
    });
  } else {
    onData(null, {
      editFocus: Reaction.state.get("edit/focus") || "productDetails"
    });
  }
}

// Decorate component and export
export default compose(
  withRouter,
  withState("newMetafield", "setNewMetaField", { key: "", value: "" }),
  composeWithTracker(composer),
  wrapComponent
);
