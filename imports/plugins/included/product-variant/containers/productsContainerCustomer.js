import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
import withCatalogItems from "imports/plugins/core/graphql/lib/hocs/withCatalogItems";
import withShopId from "/imports/plugins/core/graphql/lib/hocs/withShopId";
import withTagId from "/imports/plugins/core/graphql/lib/hocs/withTagId";
import ProductGridCustomer from "../components/customer/productGrid";

const wrapComponent = (Comp) => (
  class ProductsContainerCustomer extends Component {
    static propTypes = {
      catalogItems: PropTypes.array,
      hasMoreCatalogItems: PropTypes.bool,
      isLoadingCatalogItems: PropTypes.bool,
      isLoadingShopId: PropTypes.bool,
      isLoadingTagId: PropTypes.bool,
      loadMoreCatalogItems: PropTypes.func,
      tag: PropTypes.object,
      tagSlugOrId: PropTypes.string
    };

    constructor(props) {
      super(props);
      this.state = {
        isLoadingMore: false
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

      const { loadMoreCatalogItems } = this.props;

      loadMoreCatalogItems(() => this.setState({ isLoadingMore: false }));
    };

    render() {
      const {
        tagSlugOrId,
        tag,
        catalogItems = [],
        isLoadingShopId,
        isLoadingTagId,
        isLoadingCatalogItems,
        hasMoreCatalogItems
      } = this.props;
      const { isLoadingMore } = this.state;
      const isLoadingData = isLoadingShopId || isLoadingTagId || isLoadingCatalogItems;
      const isLoading = isLoadingData || isLoadingMore || false;
      const shouldShowNotFound = isLoading === false && (!!(tagSlugOrId && tag === null));

      return (
        <Comp
          {...this.props}
          showNotFound={shouldShowNotFound}
          canLoadMoreProducts={hasMoreCatalogItems}
          isLoading={isLoading}
          loadProducts={this.loadProducts}
          products={catalogItems}
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
  const internalShopId = Reaction.getShopId();
  const pathShopSlug = Reaction.Router.getParam("shopSlug");
  let shopSlug;
  if (pathShopSlug) {
    // User viewing /shop/SLUG
    shopSlug = pathShopSlug;
  } else {
    // User viewing primary shop or SLUG.domain.com
    const shop = Shops.findOne({ _id: internalShopId });
    if (!shop) {
      return;
    }
    shopSlug = shop.slug;
  }

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
