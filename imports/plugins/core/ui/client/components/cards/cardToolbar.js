import React, { Component } from "react";
import PropTypes from "prop-types";

class CardToobar extends Component {
  static propTypes = {
    children: PropTypes.node
  }

  render() {
    return (
      <div className="rui card-toolbar">
        {this.props.children}
      </div>
    );
  }
}

export default CardToobar;
