import React, { Component, PropTypes } from "react";
import TetherComponent from "react-tether";
import classnames from "classnames";

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
          to: "scrollParent",
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

export default Tooltip;
