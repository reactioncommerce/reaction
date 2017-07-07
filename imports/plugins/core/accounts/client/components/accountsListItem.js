import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Icon, Translation } from "/imports/plugins/core/ui/client/components";

class AccountsListItem extends Component {
  static propTypes = {
    actionType: PropTypes.oneOf(["arrow", "switch"]),
    children: PropTypes.node,
    handleClick: PropTypes.func,
    headerButton: PropTypes.bool,
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
    this.props.onClick(event, this.data);
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
      "admin": true,
      "list-item-action": true
    });

    return (
        <div className={actionClassName}>
          <Icon icon="fa fa-angle-right" onClick={this.props.handleClick} />
        </div>
    );
  }

  renderContent() {
    let content;
    const { headerButton } = this.props;
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
        <span className="Shop-Manager">{content}</span>
        {headerButton
            ? <span className="Rectangle-3-Copy-2 Badge">Default</span>
            : ""
        }
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
      "list-group-item": true,
      "Rectangle": true
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

export default AccountsListItem;
