import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import ProductGridItems from "../components/productGridItems";

class ProductGridItemsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <ProductGridItems
        {...this.props}
      />
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(ProductGridItemsContainer);
