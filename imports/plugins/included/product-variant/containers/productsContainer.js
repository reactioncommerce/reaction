import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { ITEMS_INCREMENT } from "/client/config/defaults";
import { ReactionProduct } from "/lib/api";
import { composeWithTracker } from "/lib/api/compose";
import { applyProductRevision } from "/lib/api/products";
import { Products, Tags } from "/lib/collections";
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

class ProductsContainer extends Component {
  static propTypes = {
    canLoadMoreProducts: PropTypes.bool,
    products: PropTypes.array,
    productsSubscription: PropTypes.object
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
      <ProductsComponent
        ready={this.ready}
        products={this.props.products}
        productsSubscription={this.props.productsSubscription}
        loadMoreProducts={this.loadMoreProducts}
        loadProducts={this.loadProducts}
      />
    );
  }
}
function composer(props, onData) {
  window.prerenderReady = false;

  let canLoadMoreProducts = false;

  const slug = Reaction.Router.getParam("slug");
  const tag = Tags.findOne({ slug: slug }) || Tags.findOne(slug);
  const scrollLimit = Session.get("productScrollLimit");
  let tags = {}; // this could be shop default implementation needed

  if (tag) {
    tags = { tags: [tag._id] };
  }

  // if we get an invalid slug, don't return all products
  if (!tag && slug) {
    return;
  }
  const currentTag = ReactionProduct.getTag();

  const sort = {
    [`positions.${currentTag}.position`]: 1,
    [`positions.${currentTag}.createdAt`]: 1,
    createdAt: 1
  };

  const queryParams = Object.assign({}, tags, Reaction.Router.current().queryParams);
  const productsSubscription = Meteor.subscribe("Products", scrollLimit, queryParams, sort);

  if (productsSubscription.ready()) {
    window.prerenderReady = true;
  }

  const productCursor = Products.find({
    ancestors: [],
    type: { $in: ["simple"] }
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
export default composeWithTracker(composer)(ProductsContainer);
