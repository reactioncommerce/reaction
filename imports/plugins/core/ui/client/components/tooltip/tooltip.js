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

  get attachmentClassNames() {
    if (this.props.attachment) {
      const classes = {};
      const parts = this.attachment.split(" ");

      if (parts) {
        for (const attachment of parts) {
          classes[`tooltip-element-attached-${attachment}`] = true;
        }

        return classes;
      }
    }
    return null;
  }

  renderTooltip() {
    if (this.props.tooltipContent) {
      const classes = classnames({
        "tooltip-element": true,
        "tooltip-open": true,
        "tooltip-theme-arrows": true
      }, this.attachmentClassNames);

      return (
        <div className={classes} style={{position: "relative"}}>
          <div className="tooltip-content">
            {this.props.tooltipContent}
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <TetherComponent
        attachment={this.props.attachment}
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
    )
  }
}

Tooltip.propTypes = {
  attachment: PropTypes.string,
  tooltipContent: PropTypes.node
};

Tooltip.defaultProps = {
  attachment: "bottom center"
};

export default Tooltip;
