import React, { Children, Component, PropTypes } from "react";

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
          onClick: this.handleChange,
          active: element.props.value === this.props.value
        });

        return (
          <li>{newChild}</li>
        );
      });
    }
  }

  render() {
    return (
      <ul className="rui menu dropdown-menu">
        {this.renderMenuItems()}
      </ul>
    );
  }
}

Menu.propTypes = {
  attachment: PropTypes.string,
  children: PropTypes.node,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number])
};

Menu.defaultProps = {
  attachment: "top"
};

export default Menu;
