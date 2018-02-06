import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class MenuItem extends Component {
  handleClick = (event) => {
    event.preventDefault();
    if (this.props.onClick && this.props.disabled === false) {
      this.props.onClick(event, this.props.value, this);
    }
  }

  renderIcon() {
    if (this.props.icon) {
      return (
        <Components.Icon icon={this.props.icon} style={this.props.iconStyle}/>
      );
    }
    return null;
  }

  renderLabel() {
    if (this.props.label) {
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
    return (
      <Components.Button
        tagName="div"
        className={{
          "rui": true,
          "menu-item": true,
          "flat": false,
          "btn": false,
          "btn-default": false,
          "active": this.props.active,
          [this.props.className || ""]: true
        }}
        disabled={this.props.disabled}
        data-event-action={this.props.eventAction}
        onClick={this.handleClick}
      >
        {this.renderIcon()}
        {this.renderLabel()}
      </Components.Button>
    );
  }
}

MenuItem.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  disabled: PropTypes.bool,
  eventAction: PropTypes.string,
  i18nKeyLabel: PropTypes.string,
  i18nKeySelectedLabel: PropTypes.string,
  icon: PropTypes.string,
  iconStyle: PropTypes.object,
  label: PropTypes.string,
  onClick: PropTypes.func,
  selectionLabel: PropTypes.string,
  value: PropTypes.any
};

MenuItem.defaultProps = {
  disabled: false
};

registerComponent("MenuItem", MenuItem);

export default MenuItem;
