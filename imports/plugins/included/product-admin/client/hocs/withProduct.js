import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose, withState } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { withRouter } from "react-router";
import { Media } from "/imports/plugins/core/files/client";
import { Meteor } from "meteor/meteor";
import { Reaction, formatPriceString, i18next } from "/client/api";
import { getPrimaryMediaForItem, ReactionProduct, Catalog } from "/lib/api";
import { Tags, Templates } from "/lib/collections";
import { Countries } from "/client/collections";
import { getVariantIds } from "/lib/selectors/variants";

/**
 * Create a new variant from a supplied product
 * @param {Object} product Product object
 * @returns {Promise} A promise that resolves to the new variant id
 */
export function handleCreateVariant(product) {
  return new Promise((resolve, reject) => {
    Meteor.call("products/createVariant", product._id, (error, result) => {
      if (error) {
        Alerts.alert({
          text: i18next.t("productDetailEdit.addVariantFail", { title: product.title }),
          confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
        });
        reject(error);
      } else {
        resolve({ newVariantId: result });
      }
    });
  });
}

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
 * Archive (soft delete) product
 * @param {Object} product Product object
 * @returns {undefined} No return
 */
export async function handleArchiveProduct(product) {
  await ReactionProduct.archiveProduct(product);
}

/**
 * Clone a product with all variants, options and media in tact
 * @param {Object} product Product object
 * @returns {undefined} No return
 */
export function handleCloneProduct(product) {
  ReactionProduct.cloneProduct(product);
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
  function withProduct(props) {
    const {
      history,
      newMetafield,
      setNewMetaField
    } = props;

    return (
      <Comp
        newMetafield={newMetafield}
        onArchiveProduct={async (product, redirectUrl) => {
          await handleArchiveProduct(product);
          history.push(redirectUrl);
        }}
        onCloneProduct={handleCloneProduct}
        onCreateVariant={async (product) => {
          const { newVariantId } = await handleCreateVariant(product);
          history.push(`/operator/products/${product._id}/${newVariantId}`);
        }}
        onMetaChange={setNewMetaField}
        onMetaRemove={handleMetaRemove}
        onMetaSave={(productId, metafield, index) => {
          // update existing metafield
          if (index >= 0) {
            Meteor.call("products/updateMetaFields", productId, metafield, index);
          } else if (metafield.key && metafield.value) {
            Meteor.call("products/updateMetaFields", productId, metafield);
          }

          setNewMetaField({
            key: "",
            value: ""
          });
        }}
        onProductFieldSave={handleProductFieldSave}
        onProductVariantFieldSave={handleProductVariantFieldSave}
        onRestoreProduct={handleProductRestore}
        onToggleProductVisibility={handleToggleProductVisibility}
        {...props}
      />
    );
  }

  withProduct.propTypes = {
    history: PropTypes.object,
    newMetafield: PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    }),
    setNewMetaField: PropTypes.func
  };

  return withProduct;
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
    variants.sort((a, b) => a.index - b.index);

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

    if (variantId) {
      ReactionProduct.setCurrentVariant(variantId);
    }
  }

  let tags;
  let media;
  let revisonDocumentIds;

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

    revisonDocumentIds = [product._id];

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
      revisonDocumentIds,
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
