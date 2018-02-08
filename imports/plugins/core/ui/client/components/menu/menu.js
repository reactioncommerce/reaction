import React, { Children, Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { registerComponent } from "@reactioncommerce/reaction-components";

class Menu extends Component {
  handleChange = (event, value, menuItem) => {
    if (this.props.onChange) {
      this.props.onChange(event, value, menuItem);
    }
  }

  renderMenuItems() {
    if (this.props.children) {
      return Children.map(this.props.children, (element) => {
        const newChild = React.cloneElement(element, {
          active: element.props.value === this.props.value,
          onClick: this.handleChange
        });
        const baseClassName = classnames({
          active: element.props.value === this.props.value
        }, this.props.className);
        return (
          <li className={baseClassName}>{this.props.isClickable ? newChild : element}</li>
        );
      });
    }
  }

  render() {
    const className = classnames({
      "rui": true,
      "menu": true,
      "dropdown-menu": true
    }, this.props.menuClassName);

    return (
      <ul className={className} style={this.props.style}>
        {this.renderMenuItems()}
      </ul>
    );
  }
}

Menu.propTypes = {
  attachment: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isClickable: PropTypes.bool,
  menuClassName: PropTypes.string,
  onChange: PropTypes.func,
  style: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number])
};

Menu.defaultProps = {
  attachment: "top",
  isClickable: true
};

registerComponent("Menu", Menu);

export default Menu;
