import React from "react";
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
  const target = $("#productScrollLimitLoader");
  let scrollContainer = $("#reactionAppContainer");

  if (scrollContainer.length === 0) {
    scrollContainer = $(window);
  }

  if (target.length) {
    threshold = scrollContainer.scrollTop() + scrollContainer.height() - target.height();

    if (target.offset().top < threshold) {
      if (!target.data("visible")) {
        target.data("productScrollLimit", true);
        Session.set("productScrollLimit", Session.get("productScrollLimit") + ITEMS_INCREMENT || 24);
      }
    } else {
      if (target.data("visible")) {
        target.data("visible", false);
      }
    }
  }
}

class ProductsContainer extends React.Component {

  static propTypes = {
    initialLoad: PropTypes.bool,
    products: PropTypes.array,
    productsSubscription: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      initialLoad: props.initialLoad
    };

    this.ready = this.ready.bind(this);
  }

  componentDidMount() {
    $("#reactionAppContainer").on("scroll", loadMoreProducts);
    $(window).on("scroll", loadMoreProducts);
  }

  ready = () => {
    const isInitialLoad = this.state.initialLoad === true;
    const isReady = this.props.productsSubscription.ready();

    if (isInitialLoad === false) {
      return true;
    }

    if (isReady) {
      this.setState({
        initialLoad: false
      });
      return true;
    }
    return false;
  }

  render() {
    return (
      <ProductsComponent
        ready={this.ready}
        products={this.props.products}
        productsSubscription={this.props.productsSubscription}
      />
    );
  }
}
function composer(props, onData) {
  window.prerenderReady = false;

  let stateSlug = "";
  let stateProducts = [];
  let initialLoad = true;
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

  if (stateSlug !== slug && initialLoad === false) {
    initialLoad = true;
  }

  stateSlug = slug;

  const queryParams = Object.assign({}, tags, Reaction.Router.current().queryParams);
  const productsSubscription = Meteor.subscribe("Products", scrollLimit, queryParams);

  if (productsSubscription.ready()) {
    window.prerenderReady = true;
  }

  const currentTag = ReactionProduct.getTag();
  const productCursor = Products.find({
    ancestors: [],
    type: { $in: ["simple"] }
  }, {
    sort: {
      [`positions.${currentTag}.position`]: 1,
      [`positions.${currentTag}.createdAt`]: 1,
      createdAt: 1
    }
  });

  const products = productCursor.map((product) => {
    return applyProductRevision(product);
  });

  const sortedProducts = ReactionProduct.sortProducts(products, currentTag);


  canLoadMoreProducts = productCursor.count() >= Session.get("productScrollLimit");
  stateProducts = sortedProducts;

  Session.set("productGrid/products", sortedProducts);

  const isActionViewOpen = Reaction.isActionViewOpen();
  if (isActionViewOpen === false) {
    Session.set("productGrid/selectedProducts", []);
  }

  onData(null, {
    productsSubscription,
    products: stateProducts,
    canLoadMoreProducts,
    initialLoad
  });
}
export default composeWithTracker(composer)(ProductsContainer);
