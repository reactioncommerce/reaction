import React, { Component } from "react";
import PropTypes from "prop-types";
import createFragment from "react-addons-create-fragment";
import classnames from "classnames/dedupe";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class Button extends Component {
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

  handleClick = (event) => {
    if (this.props.tagName === "a") {
      event.preventDefault();
    }

    // If this is a toogle button, and has a onToggle callback function
    if (this.props.toggle && this.props.onToggle) {
      if (this.props.toggleOn) {
        // If toggleOn is true, return the toggleOn value, or true
        this.props.onToggle(event, this.props.onValue || true);
      } else {
        // Otherwise return the value prop, or false
        this.props.onToggle(event, this.props.value || false);
      }
    } else if (this.props.onClick) {
      this.props.onClick(event, this.props.value);
    }
  }

  handleKeyUp = (event) => {
    // keyCode 32 (spacebar)
    // keyCode 13 (enter/return)
    if (event.keyCode === 32 || event.keyCode === 13) {
      this.handleClick(event);
    }
  }

  renderOnStateIcon() {
    if (this.props.onIcon) {
      return (
        <Components.Icon icon={this.props.onIcon} />
      );
    }
    return null;
  }

  renderNormalStateIcon() {
    if (this.props.icon) {
      return (
        <Components.Icon icon={this.props.icon} />
      );
    }
    return null;
  }

  renderIcon() {
    if (this.props.toggle) {
      if (this.props.toggleOn) {
        return this.renderOnStateIcon();
      }
    }

    return this.renderNormalStateIcon();
  }

  renderTooltipContent() {
    if (this.isTooltipOpen && this.props.disabled === false) {
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
      if (this.props.toggle) {
        if (this.props.toggleOn && this.props.toggleOnLabel) {
          return (
            <Components.Translation
              defaultValue={this.props.toggleOnLabel}
              i18nKey={this.props.i18nKeyToggleOnLabel}
            />
          );
        }
      }

      return (
        <Components.Translation
          defaultValue={this.props.label}
          i18nKey={this.props.i18nKeyLabel}
        />
      );
    }

    return null;
  }

  render() {
    const {
      active, status, toggleOn, primary, bezelStyle, className, containerStyle,

      // Destructure these vars as they aren't valid as attributes on the HTML element button
      iconAfter, label, i18nKeyTitle, i18nKeyLabel, i18nKeyTooltip, tabIndex, // eslint-disable-line no-unused-vars
      tooltip, icon, toggle, onIcon, eventAction, buttonType, // eslint-disable-line no-unused-vars
      toggleOnLabel, i18nKeyToggleOnLabel, tagName, onClick, onToggle, onValue, tooltipAttachment, // eslint-disable-line no-unused-vars

      // Get the rest of the properties and put them in attrs
      // these will most likely be HTML attributes
      ...attrs
    } = this.props;

    const classes = classnames({
      "rui": true,
      "btn": true,
      "btn-default": !primary &&  (status === null || status === undefined || status === "default"),
      "active": active || toggleOn,
      "btn-success": status === "success",
      "btn-danger": status === "danger",
      "btn-info": status === "info",
      "btn-warning": status === "warning",
      "btn-link": status === "link",
      "btn-cta": status === "cta",
      "btn-primary": primary === true || status === "primary",
      [bezelStyle || "flat"]: true
    }, className);

    const extraProps = {};

    if (tagName === "a") {
      extraProps.href = "#";
    }

    // If this button is not an anchor, or an actual button, then add
    // some extra props related to ARIA compliance for interactive components.
    //
    // - onKeyUp event handler for keyboard navigation
    // - role=button, as it's a simulated button
    // - tabIndex=0 so it obeys the natural tab flow
    if (tagName !== "button" && tagName !== "a") {
      extraProps.onKeyUp = this.handleKeyUp;
      extraProps.role = "button";
      extraProps.tabIndex = 0;
    }

    const buttonProps = Object.assign({
      "className": classes,
      "data-event-action": eventAction,
      "onFocus": this.handleButtonMouseOver,
      "onBlur": this.handleButtonMouseOut,
      "onMouseOut": this.handleButtonMouseOut,
      "onMouseOver": this.handleButtonMouseOver,
      "onClick": this.handleClick,
      "type": buttonType || "button"
    }, attrs, extraProps);


    // Create a react fragment for all the button children
    let buttonChildren;

    if (iconAfter) {
      buttonChildren = createFragment({
        label: this.renderLabel(),
        icon: this.renderIcon(),
        children: this.props.children
      });
    } else {
      buttonChildren = createFragment({
        icon: this.renderIcon(),
        label: this.renderLabel(),
        children: this.props.children
      });
    }

    // Button with tooltip gets some special treatment
    if (tooltip) {
      return React.createElement(tagName, buttonProps,
        <span className="rui btn-tooltip" style={{ display: "inline-flex", ...containerStyle }}>
          <Components.Tooltip attachment={tooltipAttachment} tooltipContent={this.renderTooltipContent()}>
            {buttonChildren}
          </Components.Tooltip>
        </span>
      );
    }

    // Add a wrapped container with styles for standard button
    if (containerStyle) {
      buttonChildren = (
        <div style={containerStyle}>
          {buttonChildren}
        </div>
      );
    }

    // Normal button, without tooltip
    return React.createElement(tagName, buttonProps, buttonChildren);
  }
}

Button.propTypes = {
  active: PropTypes.bool,
  bezelStyle: PropTypes.oneOf(["flat", "solid", "outline"]),
  buttonType: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  containerStyle: PropTypes.object,
  disabled: PropTypes.bool,
  eventAction: PropTypes.string,
  i18nKeyLabel: PropTypes.string,
  i18nKeyTitle: PropTypes.string,
  i18nKeyToggleOnLabel: PropTypes.string,
  i18nKeyTooltip: PropTypes.string,
  icon: PropTypes.string,
  iconAfter: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
  onIcon: PropTypes.string,
  onToggle: PropTypes.func,
  onValue: PropTypes.any,
  primary: PropTypes.bool,
  status: PropTypes.string,
  tabIndex: PropTypes.string,
  tagName: PropTypes.string,
  title: PropTypes.string,
  toggle: PropTypes.bool,
  toggleOn: PropTypes.bool,
  toggleOnLabel: PropTypes.string,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]),
  tooltipAttachment: PropTypes.string,
  value: PropTypes.any
};

Button.defaultProps = {
  active: false,
  disabled: false,
  iconAfter: false,
  tagName: "button",
  toggle: false,
  bezelStyle: "flat",
  tooltipAttachment: "bottom center"
};

registerComponent("Button", Button);

export default Button;
