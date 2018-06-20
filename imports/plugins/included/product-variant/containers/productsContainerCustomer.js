import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { ITEMS_INCREMENT } from "/client/config/defaults";
import { Catalog, Tags, Shops } from "/lib/collections";
import ProductGridCustomer from "../components/customer/productGrid";

const wrapComponent = (Comp) => (
  class ProductsContainer extends Component {
    static propTypes = {
      canLoadMoreProducts: PropTypes.bool,
      productsSubscription: PropTypes.object,
      showNotFound: PropTypes.bool // eslint-disable-line react/boolean-prop-naming
    };

    constructor(props) {
      super(props);
      this.state = {
        initialLoad: true
      };
    }

    loadProducts = () => {
      this.setState({
        initialLoad: false
      });
      // load in the next set of products
      Session.set("productScrollLimit", Session.get("productScrollLimit") + ITEMS_INCREMENT || 24);
    }

    render() {
      return (
        <Comp
          {...this.props}
          loadProducts={this.loadProducts}
        />
      );
    }
  }
);

function composer(props, onData) {
  window.prerenderReady = false;

  let canLoadMoreProducts = false;

  const queryParams = {};
  const slug = Reaction.Router.getParam("slug");
  const shopIdOrSlug = Reaction.Router.getParam("shopSlug");
  let tagIdForPosition = "_default";

  if (slug) {
    const tag = Tags.findOne({ slug }) || Tags.findOne({ _id: slug });

    // if we get an invalid slug, don't return all products
    if (!tag) {
      onData(null, {
        showNotFound: true
      });

      return;
    }
    queryParams.tagIds = [tag._id];
    tagIdForPosition = tag._id;
  }

  if (shopIdOrSlug) {
    queryParams.shopIdsOrSlugs = [shopIdOrSlug];
  }

  const queryString = Reaction.Router.current().query;
  if (queryString) {
    queryParams.query = queryString.query;
  }

  const scrollLimit = Session.get("productScrollLimit");
  const productsSubscription = Meteor.subscribe("Products/grid", scrollLimit, queryParams);

  if (productsSubscription.ready()) {
    window.prerenderReady = true;
  }

  const activeShopsIds = Shops.find({
    $or: [
      { "workflow.status": "active" },
      { _id: Reaction.getPrimaryShopId() }
    ]
  }).map((activeShop) => activeShop._id);

  const catalogCursor = Catalog.find({
    "product.type": "product-simple",
    "shopId": { $in: activeShopsIds }
  }, {
    $sort: {
      [`product.positions.${tagIdForPosition}.position`]: 1,
      createdAt: -1
    }
  });

  canLoadMoreProducts = catalogCursor.count() >= scrollLimit;

  const products = catalogCursor.map((catalogItem) => catalogItem.product);

  const currentShop = Shops.findOne({
    _id: Reaction.getPrimaryShopId()
  });

  onData(null, {
    canLoadMoreProducts,
    products,
    productsSubscription,
    shopCurrencyCode: currentShop.currency
  });
}

registerComponent("ProductsCustomer", ProductGridCustomer, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(ProductGridCustomer);
