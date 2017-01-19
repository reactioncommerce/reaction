import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Icon, Translation } from "/imports/plugins/core/ui/client/components";

class ListItem extends Component {
  static propTypes = {
    actionType: PropTypes.oneOf(["arrow"]),
    children: PropTypes.node,
    i18nKeyLabel: PropTypes.string,
    icon: PropTypes.string,
    isAdmin: PropTypes.bool,
    label: PropTypes.string,
    onClick: PropTypes.func,
    packageData: PropTypes.object,
    value: PropTypes.any
  }

  handleClick = () => {
    if (typeof this.props.onClick === "function") {
      this.props.onClick(event, this.data);
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
      </div>
    );
  }
}

export default ListItem;
