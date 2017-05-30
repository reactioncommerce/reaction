import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import ProductGridItems from "../components/productGridItems";

class ProductGridItemsContainer extends Component {
  static propTypes = {
    product: PropTypes.object
  }

  constructor() {
    super();

    this.productPath = this.productPath.bind(this);
  }

  productPath = () => {
    if (this.props.product) {
      let handle = this.props.product.handle;

      if (this.props.product.__published) {
        handle = this.props.product.__published.handle;
      }

      return Reaction.Router.pathFor("product", {
        hash: {
          handle
        }
      });
    }

    return "/";
  }

  render() {
    return (
      <ProductGridItems
        product={this.props.product}
        pdpPath={this.productPath}
      />
    );
  }
}

function composer(props, onData) {
  const product = props;

  onData(null, {
    product
  });
}

export default composeWithTracker(composer)(ProductGridItemsContainer);
