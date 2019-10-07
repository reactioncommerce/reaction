import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { withApollo } from "react-apollo";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { i18next, Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import PublishContainer from "/imports/plugins/core/catalog/client/containers/publishContainer";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";

const updateProductField = gql`
  mutation updateProductField($input: UpdateProductFieldInput!) {
    updateProductField(input: $input) {
      product {
        _id
      }
    }
  }
`;

class ProductPublishContainer extends Component {
  handleMetaRemove = (productId, metafield) => {
    Meteor.call("products/removeMetaFields", productId, metafield);
  }

  handleProductRestore = async (product) => {
    const { client } = this.props;
    const [opaqueProductId, opaqueShopId] = await getOpaqueIds([
      { namespace: "Product", id: product._id },
      { namespace: "Shop", id: Reaction.getShopId() }
    ]);

    try {
      await client.mutate({
        mutation: updateProductField,
        variables: {
          input: {
            field: "isDeleted",
            shopId: opaqueShopId,
            productId: opaqueProductId,
            value: !product.isDeleted
          }
        }
      });

      Alerts.toast(i18next.t("productDetailEdit.restoreVariantSuccess"), "success");
    } catch (error) {
      Alerts.toast(i18next.t("productDetailEdit.restoreVariantFail", { err: error }), "error");
    }
  }

  handleVisibilityChange = async (event, isProductVisible) => {
    const { product } = this.props;
    if (!product) return;

    const { client } = this.props;
    const [opaqueProductId, opaqueShopId] = await getOpaqueIds([
      { namespace: "Product", id: product._id },
      { namespace: "Shop", id: Reaction.getShopId() }
    ]);

    try {
      await client.mutate({
        mutation: updateProductField,
        variables: {
          input: {
            field: "isVisible",
            shopId: opaqueShopId,
            productId: opaqueProductId,
            value: isProductVisible
          }
        }
      });

      // if main product is updated, update the variants / options (if any)
      const variants = Products.find({
        ancestors: {
          $in: [product._id]
        }
      }).fetch();

      if (variants) {
        await Promise.all(variants.map(async (variant) => {
          const [opaqueVariantId] = await getOpaqueIds([{ namespace: "Product", id: variant._id }]);

          try {
            await client.mutate({
              mutation: updateProductField,
              variables: {
                input: {
                  field: "isVisible",
                  shopId: opaqueShopId,
                  productId: opaqueVariantId,
                  value: isProductVisible
                }
              }
            });
          } catch (error) {
            Alerts.toast(i18next.t("productDetailEdit.updateProductFieldFail", { err: error }), "error");
          }
        }));
      }

      Alerts.toast(i18next.t("productDetailEdit.restoreVariantSuccess"), "success");
    } catch (error) {
      Alerts.toast(i18next.t("productDetailEdit.restoreVariantFail", { err: error }), "error");
    }
  }

  handlePublishActions = (event, action, documentIds) => {
    if (action === "archive") {
      ReactionProduct.archiveProduct(documentIds);
    }
  }

  render() {
    return (
      <PublishContainer
        onAction={this.handlePublishActions}
        onVisibilityChange={this.handleVisibilityChange}
        {...this.props}
      />
    );
  }
}

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  const product = ReactionProduct.selectedProduct();
  let revisonDocumentIds;
  if (product) {
    revisonDocumentIds = [product._id];
    onData(null, {
      product,
      documentIds: revisonDocumentIds,
      documents: [product]
    });
  } else {
    onData(null, {});
  }
}

ProductPublishContainer.propTypes = {
  product: PropTypes.object,
  tags: PropTypes.arrayOf(PropTypes.object)
};

registerComponent("ProductPublish", ProductPublishContainer, [
  withApollo,
  composeWithTracker(composer)
]);

// Decorate component and export
export default compose(
  withApollo,
  composeWithTracker(composer)
);
