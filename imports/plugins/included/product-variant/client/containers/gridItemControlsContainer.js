import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import GridItemControls from "../components/gridItemControls";

class GridItemControlsContainer extends Component {
  static propTypes = {
    product: PropTypes.object
  }

  constructor() {
    super();

    this.hasCreateProductPermission = this.hasCreateProductPermission.bind(this);
    this.hasChanges = this.hasChanges.bind(this);
  }

  hasCreateProductPermission = () => {
    return Reaction.hasPermission("createProduct");
  }

  hasChanges =() => {
    return this.props.product.__draft ? true : false;
  }

  render() {
    return (
      <GridItemControls
        product={this.props.product}
        hasCreateProductPermission={this.hasCreateProductPermission}
        hasChanges={this.hasChanges}
      />
    );
  }
}

function composer(props, onData) {
  const product = props.product;

  onData(null, {
    product
  });
}

export default composeWithTracker(composer)(GridItemControlsContainer);
