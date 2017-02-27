import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import CardTitle from "./cardTitle";
import IconButton from "../button/iconButton";
import Icon from "../icon/icon";
import Switch from "../switch/switch";

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
        <CardTitle
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
          <Icon icon={this.props.icon} />
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
        <IconButton
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
        <Switch
          checked={this.props.switchOn}
          name={this.props.switchName}
          onChange={this.handleSwitchChange}
        />
      );
    }

    return this.props.children;
  }

  render() {
    const baseClassName = classnames({
      "rui": true,
      "panel-heading": true,
      "card-header": true,
      "expandable": this.props.actAsExpander
    });

    if (this.props.actAsExpander) {
      return (
        <div className={baseClassName}>
          <div className="content-view" onClick={this.handleClick}>
            {this.renderImage()}
            {this.renderTitle()}
          </div>
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

export default CardHeader;
