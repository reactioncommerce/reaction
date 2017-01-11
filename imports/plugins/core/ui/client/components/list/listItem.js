import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Icon, Translation } from "/imports/plugins/core/ui/client/components";

class ListItem extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    packageData: PropTypes.object
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

    })

    if (this.props.icon) {
      return (
        <div class>
          <Icon icon={this.data.icon} />
        </div>
      );
    }

    return null;
  }

  renderAction() {
    if (this.props.actionType) {
      return (
        <Icon icon="fa fa-angle-right" />
      )
    }
  }

  renderContent() {
    let content;
    const contentClassName = classnames({
      "list-item-content": true,
    })

    if (this.props.label) {
      content = (
        <Translation
          defaultValue={this.props.label}
          i18nKey={this.props.i18nKeyLabel}
        />
      );
    } else {
      content = this.props.children
    }

    return (
      <div className={contentClassName}>
        {content}
      </div>
    )
  }

  render() {
    return (
      <div className="rui-admin list-group-item" onClick={this.handleClick}>
        {this.renderIcon()}
        <div class

        {this.renderAction())}
      </div>
    );
  }
}

export default ListItem;
