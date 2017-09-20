import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class Badge extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipOpen: false
    };

    this.handleButtonMouseOver = this.handleButtonMouseOver.bind(this);
    this.handleButtonMouseOut = this.handleButtonMouseOut.bind(this);
  }

  get isTooltipOpen() {
    return this.state.tooltipOpen;
  }

  handleButtonMouseOver() {
    this.setState({
      tooltipOpen: this.props.tooltip ? true : false
    });
  }

  handleButtonMouseOut() {
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

  renderLabel() {
    if (this.props.label) {
      if (typeof this.props.label === "string") {
        return (
          <Components.Translation
            defaultValue={this.props.label}
            i18nKey={this.props.i18nKeyLabel}
          />
        );
      }
      return (
        <span>
          {this.props.label}
        </span>
      );
    }

    return null;
  }

  render() {
    const { badgeSize, className, indicator, status, tooltip, tooltipAttachment } = this.props;

    const classes = classnames({
      "rui": true,
      "badge": true,
      "badge-small": (badgeSize === null || badgeSize === undefined || badgeSize === "small"),
      "badge-large": badgeSize === "large",
      "badge-basic": status ===  "basic",
      "badge-cta": status === "cta",
      "badge-danger": status === "danger",
      "badge-default": (status === null || status === undefined || status === "default"),
      "badge-info": status === "info",
      "badge-primary": status === "primary",
      "badge-success": status === "success",
      "badge-warning": status ===  "warning",
      "badge-indicator": indicator
    }, className);

    if (tooltip) {
      return (
        <span
          onMouseOut={this.handleButtonMouseOut}
          onMouseOver={this.handleButtonMouseOver}
        >
          <Components.Tooltip attachment={tooltipAttachment} tooltipContent={this.renderTooltipContent()}>
            <span className={classes} style={{ display: "inline-flex" }}>
              {this.renderLabel()}
            </span>
          </Components.Tooltip>
        </span>
      );
    }

    return (
      <span className={classes} style={{ display: "inline-flex" }}>
        {this.renderLabel()}
      </span>
    );
  }
}

Badge.propTypes = {
  badgeSize: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  i18nKeyLabel: PropTypes.string,
  i18nKeyTooltip: PropTypes.string,
  indicator: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  status: PropTypes.string,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]),
  tooltipAttachment: PropTypes.string
};

Badge.defaultProps = {
  badgeSize: "small",
  indicator: false,
  status: "default",
  tooltipAttachment: "bottom center"
};

registerComponent("Badge", Badge);

export default Badge;
