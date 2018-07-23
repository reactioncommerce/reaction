import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { ITEMS_INCREMENT } from "/client/config/defaults";
import { Catalog, Tags, Shops } from "/lib/collections";
import withPrimaryShopId from "/imports/plugins/core/graphql/client/hocs/withPrimaryShopId";
import withTag from "/imports/plugins/core/graphql/client/hocs/withTag";
import { loadMore } from "/imports/plugins/core/graphql/lib/helpers/pagination";
import ProductGridCustomer from "../components/customer/productGrid";
import withCatalogItems from "../hocs/withCatalogItems";

const wrapComponent = (Comp) => (
  class ProductsContainerCustomer extends Component {
    static propTypes = {
      showNotFound: PropTypes.bool,
      catalogItems: PropTypes.object,
      fetchMore: PropTypes.func,
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

    handleLoadProducts = () => {
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
      const { showNotFound, catalogItems = {}, fetchMore } = this.props;
      const { isLoading } = this.state;

      const { pageInfo = {} } = catalogItems;
      const { hasNextPage } = pageInfo;
      const products = (catalogItems.edges || []).map((edge) => edge.node.product );

      return (
        <Comp
          {...this.props}
          showNotFound={showNotFound}
          canLoadMoreProducts={hasNextPage}
          isLoading={isLoading}
          loadProducts={this.handleLoadProducts}
          products={products}
          shopCurrencyCode={Reaction.getPrimaryShopCurrency()}
        />
      );
    }
  }
);

function composer(props, onData) {
  window.prerenderReady = false;

  if (!Meteor.userId()) {
    return;
  }

  const tagSlugOrId = Reaction.Router.getParam("slug");
  if (tagSlugOrId) {
    const tag = Tags.findOne({ slug: tagSlugOrId }) || Tags.findOne({ _id: tagSlugOrId });
    if (!tag) {
      onData(null, {
        showNotFound: true,
        // Skip loading GraphQL data via HOCs (withPrimaryShopId, withTag, withCatalogItems, etc),
        // since we are going to render the 404 view
        skip: true
      });
      return;
    }
  }

  // TODO multi-shop support - const shopIdOrSlug = Reaction.Router.getParam("shopSlug");
  // Currently no way to get a shop's graphql ID by mongo _id or slug

  // TODO graphql custom tag sort - $sort: { [`product.positions.${tagIdForPosition}.position`]: 1 }

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
