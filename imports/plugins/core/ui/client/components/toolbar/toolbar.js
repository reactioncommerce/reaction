import React, { Children, Component, PropTypes } from "react";
import TetherComponent from "react-tether";
import classnames from "classnames";


class Toolbar extends Component {
  render() {
    return (
      <nav className="rui toolbar navbar-inverse">
        {this.props.children}
      </nav>
    );
  }
}

Toolbar.propTypes = {
  attachment: PropTypes.string,
  children: PropTypes.node,
};

Toolbar.defaultProps = {
  attachment: "top"
};

export default Toolbar;
