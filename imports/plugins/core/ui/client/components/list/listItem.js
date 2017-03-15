import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Icon, Switch, Translation } from "/imports/plugins/core/ui/client/components";

class ListItem extends Component {
  static propTypes = {
    actionType: PropTypes.oneOf(["arrow", "switch"]),
    children: PropTypes.node,
    i18nKeyLabel: PropTypes.string,
    icon: PropTypes.string,
    isAdmin: PropTypes.bool,
    label: PropTypes.string,
    onClick: PropTypes.func,
    onSwitchChange: PropTypes.func,
    switchName: PropTypes.string,
    switchOn: PropTypes.bool,
    value: PropTypes.any
  }

  handleClick = (event) => {
    if (this.props.actionType === "switch") {
      const isChecked = typeof this.props.switchOn === "boolean" ? !this.props.switchOn : true;
      this.handleSwitchChange(event, isChecked, this.props.switchName);
    } else if (typeof this.props.onClick === "function") {
      this.props.onClick(event, this.data);
    }
  }

  handleSwitchChange = (event, isChecked, name) => {
    event.preventDefault();
    event.stopPropagation();

    if (typeof this.props.onSwitchChange === "function") {
      this.props.onSwitchChange(event, isChecked, name);
    }
  }

  get data() {
    return this.props.value;
  }

  renderIcon() {
    const iconClassName = classnames({
      "rui": true,
      "admin": this.props.isAdmin,
      "list-item-icon": true
    });

    if (this.props.icon) {
      return (
        <div className={iconClassName}>
          <Icon icon={this.data.icon} />
        </div>
      );
    }

    return null;
  }

  renderAction() {
    const actionClassName = classnames({
      "rui": true,
      "admin": this.props.isAdmin,
      "list-item-action": true
    });

    if (this.props.actionType === "switch") {
      return (
        <div className={actionClassName}>
          <Switch
            checked={this.props.switchOn}
            name={this.props.switchName}
            onChange={this.handleSwitchChange}
          />
        </div>
      );
    }

    if (this.props.actionType) {
      return (
        <div className={actionClassName}>
          <Icon icon="fa fa-angle-right" />
        </div>
      );
    }

    return null;
  }

  renderContent() {
    let content;
    const contentClassName = classnames({
      "rui": true,
      "admin": this.props.isAdmin,
      "list-item-content": true
    });

    if (this.props.label) {
      content = (
        <Translation
          defaultValue={this.props.label}
          i18nKey={this.props.i18nKeyLabel}
        />
      );
    } else {
      content = this.props.children;
    }

    return (
      <div className={contentClassName}>
        {content}
      </div>
    );
  }

  renderSubItems() {
    if (typeof this.props.label !== "undefined" && this.props.children) {
      const listItemClassName = classnames({
        "rui": true,
        "admin": this.props.isAdmin,
        "list-group-item-sub-item": true
      });

      return (
        <div className={listItemClassName}>
          {this.props.children}
        </div>
      );
    }

    return null;
  }

  render() {
    const listItemClassName = classnames({
      "rui": true,
      "admin": this.props.isAdmin,
      "list-group-item": true
    });

    return (
      <div className={listItemClassName} onClick={this.handleClick}>
        {this.renderIcon()}
        {this.renderContent()}
        {this.renderAction()}
        {this.renderSubItems()}
      </div>
    );
  }
}

export default ListItem;
