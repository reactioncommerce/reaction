import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { ITEMS_INCREMENT } from "/client/config/defaults";
import { Shops } from "/lib/collections";
import { loadMore } from "/imports/plugins/core/graphql/lib/helpers/pagination";
import withCatalogItems from "imports/plugins/core/graphql/lib/hocs/withCatalogItems";
import withShopId from "/imports/plugins/core/graphql/lib/hocs/withShopId";
import withTagId from "/imports/plugins/core/graphql/lib/hocs/withTagId";
import ProductGridCustomer from "../components/customer/productGrid";

const wrapComponent = (Comp) => (
  class ProductsContainerCustomer extends Component {
    static propTypes = {
      catalogItems: PropTypes.object,
      fetchMore: PropTypes.func,
      isLoadingCatalogItems: PropTypes.bool,
      isLoadingShopId: PropTypes.bool,
      isLoadingTagId: PropTypes.bool,
      tag: PropTypes.object,
      tagSlugOrId: PropTypes.string
    };

    constructor(props) {
      super(props);
      this.state = {
        isLoading: false
      };
    }

    componentDidMount() {
      window.prerenderReady = true;
    }

    loadProducts = () => {
      if (this.state.isLoadingMore) {
        return;
      }

      this.setState({ isLoadingMore: true });

      const { catalogItems, fetchMore } = this.props;
      const { pageInfo } = catalogItems;

      loadMore({
        queryName: "catalogItems",
        fetchMore,
        pageInfo,
        limit: ITEMS_INCREMENT
      }, () => {
        this.setState({ isLoadingMore: false });
      });
    };

    render() {
      const {
        tagSlugOrId,
        tag,
        catalogItems = {},
        isLoadingShopId,
        isLoadingTagId,
        isLoadingCatalogItems
      } = this.props;
      const { isLoadingMore } = this.state;
      const { pageInfo = {} } = catalogItems;
      const { hasNextPage } = pageInfo;
      const products = (catalogItems.edges || []).map((edge) => edge.node.product);
      const isLoadingData = isLoadingShopId || isLoadingTagId || isLoadingCatalogItems;

      return (
        <Comp
          {...this.props}
          showNotFound={!!(tagSlugOrId && tag === null)}
          canLoadMoreProducts={hasNextPage}
          isLoading={isLoadingData || isLoadingMore || false}
          loadProducts={this.loadProducts}
          products={products}
          shopCurrencyCode={Reaction.getPrimaryShopCurrency()}
        />
      );
    }
  }
);

/**
 * @name composer
 * @private
 * @summary Loads tag slug or _id from browser and passes it to GraphQL HOCs
 * @param {Object} props - Props passed down from parent components
 * @param {Function} onData - Callback to execute with props
 * @returns {undefined}
 */
function composer(props, onData) {
  window.prerenderReady = false;

  // Prevent loading GraphQL HOCs if we don't have a user account yet. All users (even anonymous) have accounts
  if (!Meteor.user()) {
    return;
  }

  // Get active shop's slug
  const shopId = Reaction.getShopId();
  const shop = Shops.findOne({ _id: shopId });
  if (!shop) {
    return;
  }
  const { slug: shopSlug } = shop;

  // Get tag slug from URL
  const tagSlugOrId = Reaction.Router.getParam("slug");

  // Pass arguments to GraphQL HOCs
  onData(null, {
    shopSlug,
    tagSlugOrId
  });
}

registerComponent("ProductsCustomer", ProductGridCustomer, [
  composeWithTracker(composer),
  withShopId,
  withTagId,
  withCatalogItems,
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  withShopId,
  withTagId,
  withCatalogItems,
  wrapComponent
)(ProductGridCustomer);
