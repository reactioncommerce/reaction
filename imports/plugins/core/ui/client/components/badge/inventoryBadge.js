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
  badgeSize: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  i18nKeyLabel: PropTypes.string,
  i18nKeyTooltip: PropTypes.string,
  indicator: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  status: PropTypes.string,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]),
  tooltipAttachment: PropTypes.string,
  variant: PropTypes.object
};

registerComponent("InventoryBadge", InventoryBadge);

export default InventoryBadge;
