import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import _ from "lodash";
import { withApollo } from "react-apollo";
import { Meteor } from "meteor/meteor";
import { Counts } from "meteor/tmeasday:publish-counts";
import { compose } from "recompose";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import ReactionError from "@reactioncommerce/reaction-error";
import { Session } from "meteor/session";
import { i18next, Reaction } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import { ReactionProduct } from "/lib/api";
import ProductGrid from "../components/productGrid";

const cloneProducts = gql`
  mutation cloneProducts($input: CloneProductsInput!) {
    cloneProducts(input: $input) {
      products {
        _id
      }
    }
  }
`;

const wrapComponent = (Comp) => (
  class ProductGridContainer extends Component {
    static propTypes = {
      client: PropTypes.object,
      isSearch: PropTypes.bool,
      productIds: PropTypes.arrayOf(PropTypes.string),
      products: PropTypes.array,
      productsByKey: PropTypes.object,
      selectedProductIds: PropTypes.array
    }

    constructor(props) {
      super(props);

      this.state = {
        initialLoad: true,
        slug: "",
        canLoadMoreProducts: false
      };
    }

    handleSelectProductItem = (isChecked, productId) => {
      let selectedProductIds = this.props.selectedProductIds || [];

      if (isChecked) {
        selectedProductIds.push(productId);
        selectedProductIds = _.uniq(selectedProductIds);
      } else {
        selectedProductIds = _.without(selectedProductIds, productId);
      }

      // Save the selected items to the Session
      Session.set("productGrid/selectedProducts", selectedProductIds);
    }

    handleSelectAllProductItems = (isChecked, productIds) => {
      let selectedProductIds;

      if (isChecked) {
        selectedProductIds = _.uniq([...productIds]);
      } else {
        selectedProductIds = [];
      }

      // Save the selected items to the Session
      Session.set("productGrid/selectedProducts", selectedProductIds);
    }

    handlePublishProducts = async (productIds, mutation) => {
      // we need to encode the productIds here to pass them to GraphQL
      const productnamespacedIdObjects = productIds.map((productId) => (
        { namespace: "Product", id: productId }
      ));
      const opaqueProductIds = await getOpaqueIds(productnamespacedIdObjects);

      await mutation({
        variables: {
          productIds: opaqueProductIds
        }
      });
    }

    handleToggleProductVisibility = (productIds, isVisible) => {
      if (Array.isArray(productIds)) {
        for (const productId of productIds) {
          Meteor.call("products/updateProductField", productId, "isVisible", isVisible);
        }
      }
    }

    handleArchiveProducts = (productIds) => {
      ReactionProduct.archiveProduct(productIds);
    }

    handleDuplicateProducts = async (productIds, mutation) => {
      // // we need to encode the productIds here to pass them to GraphQL
      // const productnamespacedIdObjects = productIds.map((productId) => (
      //   { namespace: "Product", id: productId }
      // ));
      // const opaqueProductIds = await getOpaqueIds(productnamespacedIdObjects);

      // await mutation({
      //   variables: {
      //     shopId: opaqueShopId,
      //     productIds: opaqueProductIds
      //   }
      // });



      // ReactionProduct.cloneProduct(productIds);
      console.log("we doing this?", productIds);


      const { client, shopId } = this.props;
      console.log("shopId", shopId);

      // const title = i18next.t("productDetailEdit.thisVariant");
      const namespacedProductIdObjects = productIds.map((productId) => ({ namespace: "Product", id: productId }));
      const opaqueProductIds = productIds;
      // const opaqueProductIds = await getOpaqueIds(namespacedProductIdObjects);
      const [opaqueShopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);
      console.log("opaqueIds, shop, products", opaqueShopId, opaqueProductIds);


      try {
        const awaited = await client.mutate({
          mutation: cloneProducts,
          variables: {
            input: {
              shopId: opaqueShopId,
              productIds: opaqueProductIds
            }
          }
        });

        console.log("awaited", awaited);


        if (productIds.length === 1) {
          Alerts.add(i18next.t("productDetail.clonedAlert", { product: productIds }), "success", {
            placement: "productGridItem",
            id: productIds[0],
            autoHide: true,
            dismissable: false
          });
        } else {
          Alerts.add(
            i18next.t("productDetail.clonedAlert_plural", {
              product: i18next.t("productDetail.theSelectedProducts"),
              count: 0
            }),
            "success",
            {
              placement: "productGridItem",
              id: productIds[0],
              autoHide: true,
              dismissable: false
            }
          );
        }
      } catch (error) {
        Alerts.toast(i18next.t("productDetailEdit.cloneVariantFail"), "error");
      }
    }


    handlePageChange = (event, page) => {
      Session.set("products/page", page);
    }

    handleChangeRowsPerPage = (event) => {
      Session.set("productScrollLimit", event.target.value);
    }

    get products() {
      const { isSearch, products, productsByKey, productIds } = this.props;
      if (isSearch) {
        return products;
      }
      return productIds.map((id) => productsByKey[id]);
    }

    render() {
      return (
        <Comp
          {...this.props}
          itemSelectHandler={this.handleSelectProductItem}
          onArchiveProducts={this.handleArchiveProducts}
          onChangePage={this.handlePageChange}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
          onDuplicateProducts={this.handleDuplicateProducts}
          onPublishProducts={this.handlePublishProducts}
          onSelectAllProducts={this.handleSelectAllProductItems}
          onSetProductVisibility={this.handleToggleProductVisibility}
          products={this.products}
        />
      );
    }
  }
);

/**
 * @name composer
 * @summary Builds productMediaById object and passes to child component
 * @param {Object} props - Props passed down from parent components
 * @param {Function} onData - Callback to execute with props
 * @returns {undefined}
 */
function composer(props, onData) {
  // Instantiate an object for use as a map. This object does not inherit prototype or methods from `Object`
  const productMediaById = Object.create(null);
  (props.products || []).forEach((product) => {
    const primaryMedia = Media.findOneLocal({
      "metadata.productId": product._id,
      "metadata.toGrid": 1,
      "metadata.workflow": { $nin: ["archived", "unpublished"] }
    }, {
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    });

    const variantIds = ReactionProduct.getVariants(product._id).map((variant) => variant._id);
    let additionalMedia = Media.findLocal({
      "metadata.productId": product._id,
      "metadata.variantId": { $in: variantIds },
      "metadata.workflow": { $nin: ["archived", "unpublished"] }
    }, {
      limit: 3,
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    });

    if (additionalMedia.length < 2) additionalMedia = null;

    productMediaById[product._id] = {
      additionalMedia,
      primaryMedia
    };
  });

  if (Session.get("filterByProductIds")) {
    const selectedProductIds = Object.keys(productMediaById);
    Session.set("productGrid/selectedProducts", selectedProductIds);
  }

  onData(null, {
    productMediaById,
    page: Session.get("products/page") || 0,
    productsPerPage: Session.get("productScrollLimit"),
    selectedProductIds: Session.get("productGrid/selectedProducts"),
    totalProductCount: Counts.get("products-count")
  });
}

registerComponent("ProductGrid", ProductGrid, [
  withApollo,
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  withApollo,
  composeWithTracker(composer),
  wrapComponent
)(ProductGrid);
