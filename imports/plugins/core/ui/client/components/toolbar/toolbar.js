import React, { Component, PropTypes } from "react";

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
  children: PropTypes.node
};

Toolbar.defaultProps = {
  attachment: "top"
};

export default Toolbar;
