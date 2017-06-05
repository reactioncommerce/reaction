import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import ProductGrid from "../components/productGrid";

class ProductGridContainer extends Component {
  static propTypes = {
    products: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      products: props.products.get(),
      initialLoad: true,
      slug: "",
      canLoadMoreProducts: false
    };
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
