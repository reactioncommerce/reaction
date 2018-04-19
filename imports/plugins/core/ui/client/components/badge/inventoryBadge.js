import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class InventoryBadge extends Component {
  render() {
    if (this.props.label) {
      return (
        <Components.Badge {...this.props} />
      );
    }
    return null;
  }
}

InventoryBadge.propTypes = {
  label: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

registerComponent("InventoryBadge", InventoryBadge);

export default InventoryBadge;
