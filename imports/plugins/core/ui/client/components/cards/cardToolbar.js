import React, { Component, PropTypes } from "react";

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
