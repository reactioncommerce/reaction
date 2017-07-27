import React, { Component } from "react";
import PropTypes from "prop-types";
import CopyToClipboard from "react-copy-to-clipboard";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class ClickToCopy extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipOpen: false
    };

    this.handleCtcMouseOver = this.handleCtcMouseOver.bind(this);
    this.handleCtcMouseOut = this.handleCtcMouseOut.bind(this);
  }

  get isTooltipOpen() {
    return this.state.tooltipOpen;
  }

  handleCtcMouseOver() {
    this.setState({
      tooltipOpen: this.props.tooltip ? true : false
    });
  }

  handleCtcMouseOut() {
    this.setState({
      tooltipOpen: false
    });
  }

  renderTooltipContent() {
    if (this.isTooltipOpen) {
      if (typeof this.props.tooltip === "string") {
        return (
          <Components.Translation defaultValue={this.props.tooltip} i18nKey={this.props.i18nKeyTooltip} />
        );
      }

      return (
        <div>
          {this.props.tooltip}
        </div>
      );
    }

    return null;
  }

  render() {
    return (
      <span
        className="rui"
        onClick={this.handleClick}
        onMouseOver={this.handleCtcMouseOver}
        onMouseOut={this.handleCtcMouseOut}
        style={{ display: "inline-flex" }}
      >
        <Components.Tooltip tooltipContent={this.renderTooltipContent()} attachement={this.props.tooltipPosition}>
          <CopyToClipboard
            text={this.props.copyToClipboard}
            onCopy={() => this.setState({ copied: true })}
          >
            <span>{this.props.displayText}</span>
          </CopyToClipboard>
        </Components.Tooltip>
      </span>
    );
  }
}

ClickToCopy.propTypes = {
  copyToClipboard: PropTypes.string,
  displayText: PropTypes.string,
  i18nKeyTooltip: PropTypes.string,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]),
  tooltipPosition: PropTypes.string
};

ClickToCopy.defaultProps = {
  tooltip: "Copy to Clipboard",
  tooltipPosition: "middle left"
};

registerComponent("ClickToCopy", ClickToCopy);

export default ClickToCopy;
