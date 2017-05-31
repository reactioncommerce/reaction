import _ from "lodash";
import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import GridItemControls from "../components/gridItemControls";

class GridItemControlsContainer extends Component {
  static propTypes = {
    isSelected: PropTypes.bool,
    product: PropTypes.object
  }

  constructor() {
    super();

    this.hasCreateProductPermission = this.hasCreateProductPermission.bind(this);
    this.hasChanges = this.hasChanges.bind(this);
    this.checked = this.checked.bind(this);
  }

  hasCreateProductPermission = () => {
    return Reaction.hasPermission("createProduct");
  }

  hasChanges =() => {
    return this.props.product.__draft ? true : false;
  }

  checked = () => {
    return this.props.isSelected === true;
  }

  render() {
    return (
      <GridItemControls
        product={this.props.product}
        hasCreateProductPermission={this.hasCreateProductPermission}
        hasChanges={this.hasChanges}
        checked={this.checked}
      />
    );
  }
}

function composer(props, onData) {
  const product = props.product;
  let isSelected;

  if (product) {
    const selectedProducts = Session.get("productGrid/selectedProducts");
    isSelected = _.isArray(selectedProducts) ? selectedProducts.indexOf(product._id) >= 0 : false;
  }

  onData(null, {
    product,
    isSelected
  });
}

export default composeWithTracker(composer)(GridItemControlsContainer);
