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
      tooltipOpen: !!this.props.tooltip
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
      <CopyToClipboard
        text={this.props.copyToClipboard}
        onCopy={() => this.setState({ copied: true })}
      >
        <Components.Button
          tagName="span"
          className={{ btn: false }}
          onClick={this.handleClick}
          style={{ display: "inline-flex" }}
          tooltip={this.props.tooltip}
          i18nKeyTooltip={this.props.i18nKeyTooltip}
          tooltipAttachment={this.tooltipAttachment}
        >
          {this.props.displayText}
        </Components.Button>
      </CopyToClipboard>
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
