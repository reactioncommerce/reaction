import React, { Component } from "react";
import PropTypes from "prop-types";
import TetherComponent from "react-tether";
import classnames from "classnames";
import { registerComponent } from "@reactioncommerce/reaction-components";

class Tooltip extends Component {
  /**
   * attachment
   * @description Return the attachment for the tooltip or the default
   * @return {String} attachment
   */
  get attachment() {
    return this.props.attachment || Tooltip.defaultProps.attachment;
  }

  renderTooltip() {
    if (this.props.tooltipContent) {
      return (
        <div className="tooltip-content">
          {this.props.tooltipContent}
        </div>
      );
    }

    return null;
  }

  render() {
    return (
      <TetherComponent
        attachment={this.attachment}
        classPrefix="tooltip"
        className={classnames({
          "tooltip-element": true,
          "tooltip-open": true,
          "tooltip-theme-arrows": true
        })}
        constraints={[{
          to: "window",
          attachment: "together"
        }]}
      >
        <div>
          {this.props.children}
        </div>
        {this.renderTooltip()}
      </TetherComponent>
    );
  }
}

Tooltip.propTypes = {
  attachment: PropTypes.string,
  children: PropTypes.node,
  tooltipContent: PropTypes.node
};

Tooltip.defaultProps = {
  attachment: "bottom center"
};

registerComponent("Tooltip", Tooltip);

export default Tooltip;
