import React, { Component, PropTypes } from "react";
import createFragment from "react-addons-create-fragment";
import classnames from "classnames/dedupe";
import Icon from "../icon/icon.jsx";
import { Tooltip, Translation } from "../";

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

  renderOnStateIcon() {
    if (this.props.onIcon) {
      return (
        <Icon icon={this.props.onIcon} />
      );
    }
    return null;
  }

  renderNormalStateIcon() {
    if (this.props.icon) {
      return (
        <Icon icon={this.props.icon} />
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
          <Translation defaultValue={this.props.tooltip} i18nKey={this.props.i18nKeyTooltip} />
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
            <Translation
              defaultValue={this.props.toggleOnLabel}
              i18nKey={this.props.i18nKeyToggleOnLabel}
            />
          );
        }
      }

      return (
        <Translation
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
      iconAfter, label, i18nKeyTitle, i18nKeyLabel, i18nKeyTooltip, // eslint-disable-line no-unused-vars
      tooltip, icon, toggle, onIcon, eventAction, buttonType, // eslint-disable-line no-unused-vars
      toggleOnLabel, i18nKeyToggleOnLabel, tagName, onClick, onToggle, onValue, tooltipPosition, // eslint-disable-line no-unused-vars

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

    const buttonProps = Object.assign({
      "className": classes,
      "data-event-action": eventAction,
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
          <Tooltip tooltipContent={this.renderTooltipContent()}>
            {buttonChildren}
          </Tooltip>
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
  tagName: PropTypes.string,
  title: PropTypes.string,
  toggle: PropTypes.bool,
  toggleOn: PropTypes.bool,
  toggleOnLabel: PropTypes.string,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]),
  tooltipPosition: PropTypes.string,
  value: PropTypes.any
};

Button.defaultProps = {
  active: false,
  disabled: false,
  iconAfter: false,
  tagName: "button",
  toggle: false,
  bezelStyle: "flat"
};

export default Button;
