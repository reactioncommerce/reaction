import React, { Children, Component, PropTypes } from "react";
import TetherComponent from "react-tether";
import classnames from "classnames";


class Menu extends Component {

  handleChange = (event, value) => {
    console.log("--", value);
    if (this.props.onChange) {
      this.props.onChange(event, value);
    }
  }

  renderMenuItems() {
    return Children.map(this.props.children, (element) => {
      const newChild = React.cloneElement(element, {
        onClick: this.handleChange
      });

      return (
        <li>{newChild}</li>
      );
    });
  }

  render() {
    return (
      <ul className="rui dropdown-menu">
        {this.renderMenuItems()}
      </ul>
    );
  }
}

Menu.propTypes = {
  attachment: PropTypes.string,
  children: PropTypes.node
};

Menu.defaultProps = {
  attachment: "top"
};

export default Menu;
