import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { ITEMS_INCREMENT } from "/client/config/defaults";
import { ReactionProduct } from "/lib/api";
import { Catalog, Tags, Shops } from "/lib/collections";
import ProductGridCustomer from "../components/customer/productGrid";

const wrapComponent = (Comp) => (
  class ProductsContainer extends Component {
    static propTypes = {
      canLoadMoreProducts: PropTypes.bool,
      productsSubscription: PropTypes.object,
      showNotFound: PropTypes.bool
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

  const slug = Reaction.Router.getParam("slug");
  const shopIdOrSlug = Reaction.Router.getParam("shopSlug");

  const tag = Tags.findOne({ slug }) || Tags.findOne(slug);
  const scrollLimit = Session.get("productScrollLimit");
  let tags = {}; // this could be shop default implementation needed
  let shopIds = {};

  if (tag) {
    tags = { tags: [tag._id] };
  }

  if (shopIdOrSlug) {
    shopIds = { shops: [shopIdOrSlug] };
  }

  // if we get an invalid slug, don't return all products
  if (!tag && slug) {
    onData(null, {
      showNotFound: true
    });

    return;
  }

  const currentTag = ReactionProduct.getTag();

  const sort = {
    [`positions.${currentTag}.position`]: 1,
    [`positions.${currentTag}.createdAt`]: 1,
    createdAt: 1
  };

  const queryParams = Object.assign({}, tags, Reaction.Router.current().query, shopIds);
  const productsSubscription = Meteor.subscribe("Products/grid", scrollLimit, queryParams, sort);

  if (productsSubscription.ready()) {
    window.prerenderReady = true;
  }

  const activeShopsIds = Shops.find({
    $or: [
      { "workflow.status": "active" },
      { _id: Reaction.getPrimaryShopId() }
    ]
  }).map((activeShop) => activeShop._id);

  const productCursor = Catalog.find({
    ancestors: [],
    type: { $in: ["product-simple"] },
    shopId: { $in: activeShopsIds }
  }, {
    $sort: sort
  });

  canLoadMoreProducts = productCursor.count() >= Session.get("productScrollLimit");

  const products = productCursor.fetch();
  onData(null, {
    canLoadMoreProducts,
    products,
    productsSubscription
  });
}

registerComponent("ProductsCustomer", ProductGridCustomer, [
  composeWithTracker(composer)
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(ProductGridCustomer);
