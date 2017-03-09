import React, { Component, PropTypes } from "react";
import { Translation } from "../translation";

class CardToobar extends Component {
  static propTypes = {
    children: PropTypes.node,
    element: PropTypes.node,
    i18nKeyTitle: PropTypes.string,
    title: PropTypes.string
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
