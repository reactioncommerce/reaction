import React, { Component, PropTypes } from "react";
import classnames from "classnames/dedupe";

class TabItem extends Component {
  static propTypes = {
    active: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    href: PropTypes.string,
    index: PropTypes.number,
    onClick: PropTypes.func,
    value: PropTypes.any
  }

  handleClick = (event) => {
    if (typeof this.props.onClick === "function") {
      event.preventDefault();
      this.props.onClick(event, this.props.value, this.props.index);
    }
  }

  render() {
    const {
      active,
      className,
      // Remove props that cannot be added to DOM elements
      onClick, value, href, index, // eslint-disable-line no-unused-vars

      // All other props pass on through
      ...otherProps
    } = this.props;

    const baseClassName = classnames({
      rui: true,
      tab: true,
      active
    }, className);

    return (
      <li {...otherProps} className={baseClassName} role="presentation">
        <a onClick={this.handleClick} href={href} style={{ width: "100%", height: "100%" }}>
          {this.props.children}
        </a>
      </li>
    );
  }
}

export default TabItem;
