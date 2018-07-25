import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { ITEMS_INCREMENT } from "/client/config/defaults";
import { loadMore } from "/imports/plugins/core/graphql/lib/helpers/pagination";
import withCatalogItems from "imports/plugins/core/graphql/lib/hocs/withCatalogItems";
import withPrimaryShopId from "/imports/plugins/core/graphql/lib/hocs/withPrimaryShopId";
import withTag from "/imports/plugins/core/graphql/lib/hocs/withTag";
import ProductGridCustomer from "../components/customer/productGrid";

const wrapComponent = (Comp) => (
  class ProductsContainerCustomer extends Component {
    static propTypes = {
      catalogItems: PropTypes.object,
      fetchMore: PropTypes.func,
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
      if (this.state.isLoading) {
        return;
      }

      this.setState({ isLoading: true });

      const { catalogItems, fetchMore } = this.props;
      const { pageInfo } = catalogItems;

      loadMore({
        queryName: "catalogItems",
        fetchMore,
        pageInfo,
        limit: ITEMS_INCREMENT
      }, () => {
        this.setState({ isLoading: false });
      });
    };

    render() {
      const { tagSlugOrId, tag, catalogItems = {} } = this.props;
      const { isLoading } = this.state;
      const { pageInfo = {} } = catalogItems;
      const { hasNextPage } = pageInfo;
      const products = (catalogItems.edges || []).map((edge) => edge.node.product);

      return (
        <Comp
          {...this.props}
          showNotFound={!!(tagSlugOrId && tag === null)}
          canLoadMoreProducts={hasNextPage}
          isLoading={isLoading}
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

  const tagSlugOrId = Reaction.Router.getParam("slug");

  // TODO multi-shop support - const shopIdOrSlug = Reaction.Router.getParam("shopSlug");
  // Currently no way to get a shop's graphql ID by mongo _id or slug

  // TODO graphql title query support - const queryString = Reaction.Router.current().query;

  onData(null, { tagSlugOrId });
}


registerComponent("ProductsCustomer", ProductGridCustomer, [
  composeWithTracker(composer),
  withPrimaryShopId,
  withTag,
  withCatalogItems,
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  withPrimaryShopId,
  withTag,
  withCatalogItems,
  wrapComponent
)(ProductGridCustomer);
