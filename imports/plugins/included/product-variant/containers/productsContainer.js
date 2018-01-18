import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { ITEMS_INCREMENT } from "/client/config/defaults";
import { ReactionProduct } from "/lib/api";
import { applyProductRevision } from "/lib/api/products";
import { Products, Tags, Shops } from "/lib/collections";
import ProductsComponent from "../components/products";

/**
 * loadMoreProducts
 * @summary whenever #productScrollLimitLoader becomes visible, retrieve more results
 * this basically runs this:
 * Session.set('productScrollLimit', Session.get('productScrollLimit') + ITEMS_INCREMENT);
 * @return {undefined}
 */
function loadMoreProducts() {
  let threshold;
  const target = document.querySelectorAll("#productScrollLimitLoader");
  let scrollContainer = document.querySelectorAll("#container-main");
  if (scrollContainer.length === 0) {
    scrollContainer = window;
  }

  if (target.length) {
    threshold = scrollContainer[0].scrollHeight - scrollContainer[0].scrollTop === scrollContainer[0].clientHeight;

    if (threshold) {
      if (!target[0].getAttribute("visible")) {
        target[0].setAttribute("productScrollLimit", true);
        Session.set("productScrollLimit", Session.get("productScrollLimit") + ITEMS_INCREMENT || 24);
      }
    } else {
      if (target[0].getAttribute("visible")) {
        target[0].setAttribute("visible", false);
      }
    }
  }
}

const wrapComponent = (Comp) => (
  class ProductsContainer extends Component {
    static propTypes = {
      canLoadMoreProducts: PropTypes.bool,
      products: PropTypes.array,
      productsSubscription: PropTypes.object,
      showNotFound: PropTypes.bool
    };

    constructor(props) {
      super(props);
      this.state = {
        initialLoad: true
      };

      this.ready = this.ready.bind(this);
      this.loadMoreProducts = this.loadMoreProducts.bind(this);
    }

    ready = () => {
      if (this.props.showNotFound === true) {
        return false;
      }

      const isInitialLoad = this.state.initialLoad === true;
      const isReady = this.props.productsSubscription.ready();

      if (isInitialLoad === false) {
        return true;
      }

      if (isReady) {
        return true;
      }

      return false;
    }

    loadMoreProducts = () => {
      return this.props.canLoadMoreProducts === true;
    }

    loadProducts = (event) => {
      event.preventDefault();
      this.setState({
        initialLoad: false
      });
      loadMoreProducts();
    }

    render() {
      return (
        <Comp
          ready={this.ready}
          products={this.props.products}
          productsSubscription={this.props.productsSubscription}
          loadMoreProducts={this.loadMoreProducts}
          loadProducts={this.loadProducts}
          showNotFound={this.props.showNotFound}
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

  // Get the current user and their preferences
  const user = Meteor.user();
  const prefs = user && user.profile && user.profile.preferences;

  // Edit mode is true by default
  let editMode = true;

  // if we have a "viewAs" preference and the preference is not set to "administrator", then edit mode is false
  if (prefs && prefs["reaction-dashboard"] && prefs["reaction-dashboard"].viewAs) {
    if (prefs["reaction-dashboard"].viewAs !== "administrator") {
      editMode = false;
    }
  }

  const queryParams = Object.assign({}, tags, Reaction.Router.current().queryParams, shopIds);
  const productsSubscription = Meteor.subscribe("Products", scrollLimit, queryParams, sort, editMode);

  if (productsSubscription.ready()) {
    window.prerenderReady = true;
  }

  const activeShopsIds = Shops.find({
    $or: [
      { "workflow.status": "active" },
      { _id: Reaction.getPrimaryShopId() }
    ]
  }).fetch().map(activeShop => activeShop._id);

  const productCursor = Products.find({
    ancestors: [],
    type: { $in: ["simple"] },
    shopId: { $in: activeShopsIds }
  });

  const products = productCursor.map((product) => {
    return applyProductRevision(product);
  });

  const sortedProducts = ReactionProduct.sortProducts(products, currentTag);

  canLoadMoreProducts = productCursor.count() >= Session.get("productScrollLimit");
  const stateProducts = sortedProducts;

  Session.set("productGrid/products", sortedProducts);

  const isActionViewOpen = Reaction.isActionViewOpen();
  if (isActionViewOpen === false) {
    Session.set("productGrid/selectedProducts", []);
  }

  onData(null, {
    productsSubscription,
    products: stateProducts,
    canLoadMoreProducts
  });
}

registerComponent("Products", ProductsComponent, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(ProductsComponent);
