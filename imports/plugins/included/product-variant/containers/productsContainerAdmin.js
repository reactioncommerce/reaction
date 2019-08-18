import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Session } from "meteor/session";
import { Tracker } from "meteor/tracker";
import { Reaction } from "/client/api";
import { ITEMS_INCREMENT } from "/client/config/defaults";
import { Products, Tags, Shops } from "/lib/collections";
import { resubscribeAfterCloning } from "/lib/api/products";
import ProductsComponent from "../components/products";

const reactiveProductIds = new ReactiveVar([], (oldVal, newVal) => JSON.stringify(oldVal.sort()) === JSON.stringify(newVal.sort()));

// Isolated resubscribe to product grid images, only when the list of product IDs changes
Tracker.autorun(() => {
  Meteor.subscribe("ProductGridMedia", reactiveProductIds.get());
});

Tracker.autorun(() => {
  const isActionViewOpen = Reaction.isActionViewOpen();
  if (isActionViewOpen === false) {
    Session.set("productGrid/selectedProducts", []);
  }
});

/**
 * This basically runs this:
 *   Session.set('productScrollLimit', Session.get('productScrollLimit') + ITEMS_INCREMENT);
 * @summary whenever `#productScrollLimitLoader` becomes visible, retrieve more results.
 * @returns {undefined}
 * @private
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
    } else if (target[0].getAttribute("visible")) {
      target[0].setAttribute("visible", false);
    }
  }
}

const wrapComponent = (Comp) => (
  class ProductsContainer extends Component {
    static propTypes = {
      canLoadMoreProducts: PropTypes.bool,
      isProductsSubscriptionReady: PropTypes.bool,
      showNotFound: PropTypes.bool // eslint-disable-line react/boolean-prop-naming
    };

    constructor(props) {
      super(props);
      this.state = {
        initialLoad: true
      };
    }

    get isReady() {
      const { isProductsSubscriptionReady, showNotFound } = this.props;

      if (showNotFound === true) {
        return false;
      }
      if (this.state.initialLoad !== true) {
        return true;
      }

      return isProductsSubscriptionReady;
    }

    filterByProductIds = (productIds) => {
      Session.set("filterByProductIds", productIds);
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
          {...this.props}
          isReady={this.isReady}
          loadProducts={this.loadProducts}
          filterByProductIds={this.filterByProductIds}
        />
      );
    }
  }
);

/**
 * @summary Products composer
 * @param {Object} props Props from parent
 * @param {Function} onData Call with props changes
 * @returns {undefined}
 */
function composer(props, onData) {
  window.prerenderReady = false;

  const queryParams = Object.assign({}, Reaction.Router.current().query);

  const filterByProductIds = Session.get("filterByProductIds");

  if (Array.isArray(filterByProductIds) && filterByProductIds.length) {
    queryParams.productIds = filterByProductIds;
  } else if (queryParams.productIds) {
    queryParams.productIds = queryParams.productIds.split(",").map((id) => id.trim());
  }

  // Filter by tag
  const tagIdOrSlug = Reaction.Router.getParam("slug");
  if (tagIdOrSlug) {
    const tag = Tags.findOne({ slug: tagIdOrSlug }) || Tags.findOne({ _id: tagIdOrSlug });
    // if we get an invalid slug, don't return all products
    if (!tag) {
      onData(null, {
        showNotFound: true
      });
      return;
    }

    queryParams.tags = [tag._id];
  }

  // Filter by shop
  const shopIdOrSlug = Reaction.Router.getParam("shopSlug");
  if (shopIdOrSlug) {
    queryParams.shops = [shopIdOrSlug];
  }

  const scrollLimit = Session.get("productScrollLimit");
  const productPage = Session.get("products/page") || 0;
  const sort = { createdAt: 1 };

  // Now that we have the necessary info, we can subscribe to Products we need
  let productsSubscription = Meteor.subscribe("ProductsAdminList", productPage, scrollLimit, queryParams, sort);

  // Force re-running products subscription when a product is cloned
  const resubscribe = resubscribeAfterCloning.get();
  if (resubscribe) {
    resubscribeAfterCloning.set(false);
    productsSubscription.stop();
    productsSubscription = Meteor.subscribe("ProductsAdminList", productPage, scrollLimit, queryParams, sort);
  }

  if (productsSubscription.ready()) {
    window.prerenderReady = true;
  }

  const activeShopsIds = Shops.find({
    $or: [
      { "workflow.status": "active" },
      { _id: Reaction.getPrimaryShopId() }
    ]
  }).map((activeShop) => activeShop._id);

  const products = Products.find({
    ancestors: [],
    type: "simple",
    shopId: { $in: activeShopsIds }
  }, {
    sort
  }).fetch();
  Session.set("productGrid/products", products);

  // Update ID list for ProductGridMedia subscription
  const productIds = products.map((product) => product._id);
  reactiveProductIds.set(productIds);

  const selectedProducts = Session.get("productGrid/selectedProducts");

  if (Array.isArray(selectedProducts)) {
    if (selectedProducts.length > 0) {
      // Show the actionView if there are products selected.
      Reaction.showActionView({
        label: "Grid Settings",
        i18nKeyLabel: "gridSettingsPanel.title",
        template: "productSettings",
        type: "product"
      });
    } else {
      // If no products are selected, and we're currently displaying the "productSettings" grid admin component,
      // then hide the actionView.
      const currentActionView = Reaction.getActionView();
      if (currentActionView && currentActionView.template === "productSettings") {
        Reaction.hideActionView();
      }
    }
  }

  onData(null, {
    canLoadMoreProducts: products.length >= scrollLimit,
    isProductsSubscriptionReady: productsSubscription.ready(),
    products
  });
}

registerComponent("ProductsAdmin", ProductsComponent, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(ProductsComponent);
