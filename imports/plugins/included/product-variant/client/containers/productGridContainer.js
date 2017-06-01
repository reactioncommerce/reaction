import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import ProductGrid from "../components/productGrid";

class ProductGridContainer extends Component {
  static propTypes = {
    grid: PropTypes.object
  }

  render() {
    return (
      <ProductGrid />
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(ProductGridContainer);
