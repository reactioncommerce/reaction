import _ from "lodash";
import React, { Component, PropTypes } from "react";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { applyProductRevision } from "/lib/api/products";
import { Products, Tags } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import ProductGrid from "../components/productGrid";

class ProductGridContainer extends Component {
  static propTypes = {
    grid: PropTypes.object
  }

  constructor() {
    super();

    this.state = {
      products: [],
      initialLoad: true,
      slug: "",
      canLoadMoreProducts: false
    };
  }

  componentWillMount() {
    this.autorun();
  }

  autorun = () => {
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

    if (_.isEqual(this.state.slug, slug) === false && this.state.initialLoad === false) {
      this.setState({ initialLoad: true });
    }


    // ////// Retrieving Products ////////

    const queryParams = Object.assign({}, tags, Reaction.Router.current().queryParams);
    const productsSubscription = Meteor.subscribe("Products", scrollLimit, queryParams);

    // Once our products subscription is ready, we are ready to render
    if (productsSubscription.ready()) {
      window.prerenderReady = true;
    }

    // we are caching `currentTag` or if we are not inside tag route, we will
    // use shop name as `base` name for `positions` object
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

    this.setState({
      canLoadMoreProducts: productCursor.count() >= Session.get("productScrollLimit"),
      products: sortedProducts,
      slug: slug
    });
  }

  render() {
    return (
      <ProductGrid products={this.state.products} />
    );
  }
}


function composer(props, onData) {

  onData(null, {});
}

export default composeWithTracker(composer)(ProductGridContainer);
