import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { withApollo } from "react-apollo";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import ReactionError from "@reactioncommerce/reaction-error";
import { Meteor } from "meteor/meteor";
import { i18next, Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import PublishContainer from "/imports/plugins/core/catalog/client/containers/publishContainer";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";

const archiveProducts = gql`
  mutation archiveProducts($input: ArchiveProductsInput!) {
    archiveProducts(input: $input) {
      products {
        _id
      }
    }
  }
`;

class ProductPublishContainer extends Component {
  handleMetaRemove = (productId, metafield) => {
    Meteor.call("products/removeMetaFields", productId, metafield);
  }

  handleProductRestore = (product) => {
    Meteor.call("products/updateProductField", product._id, "isDeleted", false);
  }

  handleVisibilityChange = (event, isProductVisible) => {
    const { product } = this.props;
    if (!product) return;

    // Update main product
    Meteor.call("products/updateProductField", product._id, "isVisible", isProductVisible);

    const variants = Products.find({
      ancestors: {
        $in: [product._id]
      }
    }).fetch();

    variants.map((variant) =>
      // update variant
      Meteor.call("products/updateProductField", variant._id, "isVisible", isProductVisible));
  }

  handlePublishActions = async (event, action, productIds) => {
    if (action === "archive") {
      const { client } = this.props;
      const namespacedProductIdObjects = productIds.map((productId) => ({ namespace: "Product", id: productId }));
      const opaqueProductIds = await getOpaqueIds(namespacedProductIdObjects);
      const [opaqueShopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);

      try {
        await client.mutate({
          mutation: archiveProducts,
          variables: {
            input: {
              shopId: opaqueShopId,
              productIds: opaqueProductIds
            }
          }
        });

        Alerts.toast(i18next.t("productDetailEdit.archiveProductsSuccess"), "success");
      } catch (error) {
        Alerts.toast(i18next.t("productDetailEdit.archiveProductsFail", { err: error }), "error");
        throw new ReactionError("server-error", "Unable to archive product");
      }
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
  composeWithTracker(composer),
)(ProductPublishContainer);
