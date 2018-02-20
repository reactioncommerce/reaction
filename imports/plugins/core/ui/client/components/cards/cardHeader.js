import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class CardHeader extends Component {
  static defaultProps = {
    actAsExpander: false,
    expandable: false
  };

  static propTypes = {
    actAsExpander: PropTypes.bool,
    children: PropTypes.node,
    expandOnSwitchOn: PropTypes.bool,
    expanded: PropTypes.bool,
    i18nKeyTitle: PropTypes.string,
    icon: PropTypes.string,
    imageView: PropTypes.node,
    isValid: PropTypes.bool,
    onClick: PropTypes.func,
    onSwitchChange: PropTypes.func,
    showSwitch: PropTypes.bool,
    switchName: PropTypes.string,
    switchOn: PropTypes.bool,
    title: PropTypes.string
  };

  handleClick = (event) => {
    event.preventDefault();

    if (typeof this.props.onClick === "function") {
      this.props.onClick(event);
    }
  }

  handleSwitchChange = (event, isChecked, name) => {
    if (this.props.expandOnSwitchOn && this.props.actAsExpander && this.props.expanded === false && isChecked === true) {
      this.handleClick(event);
    }

    if (typeof this.props.onSwitchChange === "function") {
      this.props.onSwitchChange(event, isChecked, name);
    }
  }

  renderTitle() {
    if (this.props.title) {
      return (
        <Components.CardTitle
          i18nKeyTitle={this.props.i18nKeyTitle}
          title={this.props.title}
        />
      );
    }
    return null;
  }

  renderImage() {
    if (this.props.icon) {
      return (
        <div className="image">
          <Components.Icon icon={this.props.icon} />
        </div>
      );
    }

    if (this.props.imageView) {
      return (
        <div className="image">
          {this.props.imageView}
        </div>
      );
    }

    return null;
  }

  renderDisclsoureArrow() {
    const expanderClassName = classnames({
      rui: true,
      expander: true,
      open: this.props.expanded
    });

    return (
      <div className={expanderClassName}>
        <Components.IconButton
          icon="fa fa-angle-down"
          bezelStyle="outline"
          style={{ borderColor: "#dddddd" }}
          onClick={this.handleClick}
        />
      </div>
    );
  }

  renderChildren() {
    if (this.props.showSwitch) {
      return (
        <Components.Switch
          checked={this.props.switchOn}
          name={this.props.switchName}
          onChange={this.handleSwitchChange}
        />
      );
    }

    return this.props.children;
  }

  render() {
    let validation = false;

    if (this.props.isValid === false) {
      validation = true;
    }

    const baseClassName = classnames({
      "rui": true,
      "panel-heading": true,
      "card-header": true,
      "expandable": this.props.actAsExpander,
      validation
    });

    if (this.props.actAsExpander) {
      return (
        <div className={baseClassName}>
          <Components.Button
            tagName="div"
            className={{
              "btn": false,
              "content-view": true
            }}
            onClick={this.handleClick}
          >
            {this.renderImage()}
            {this.renderTitle()}
          </Components.Button>
          <div className="action-view">
            {this.renderChildren()}
          </div>
          {this.renderDisclsoureArrow()}
        </div>
      );
    }

    return (
      <div className={baseClassName}>
        <div className="content-view">
          {this.renderTitle()}
        </div>
        <div className="action-view">
          {this.props.children}
        </div>
      </div>
    );
  }
}

registerComponent("CardHeader", CardHeader);

export default CardHeader;
