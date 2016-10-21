import React, { Component, PropTypes } from "react";
import classnames from "classnames/dedupe";
import Icon from "../icon/icon.jsx";
import { Translation } from "../";

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
        <Icon icon={this.props.icon} />
      );
    }
    return null;
  }

  renderLabel() {
    if (this.props.label) {
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
    const baseClassName = classnames({
      "rui": true,
      "menu-item": true,
      "active": this.props.active,
      "disabled": this.props.disabled === true
    }, this.props.className);

    return (
      <a
        className={baseClassName}
        href="#"
        data-event-action={this.props.eventAction}
        onClick={this.handleClick}
        role="button"
      >
        {this.renderIcon()}
        {this.renderLabel()}
      </a>
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
  label: PropTypes.string,
  onClick: PropTypes.func,
  selectionLabel: PropTypes.string,
  value: PropTypes.any
};

MenuItem.defaultProps = {
  active: false,
  disabled: false
};

export default MenuItem;
