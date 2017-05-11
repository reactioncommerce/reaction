import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Header from "./header";
import CartDrawer from "./cartDrawer";
import { Content } from "./";


class CoreLayout extends Component {
  static propTypes = {
    actionViewIsOpen: PropTypes.bool,
    data: PropTypes.object,
    structure: PropTypes.object
  }

  render() {
    const pageClassName = classnames({
      "page": true,
      "show-settings": this.props.actionViewIsOpen
    });

    return (
      <div className={pageClassName} id="reactionAppContainer">
        <Header template={this.props.structure.layoutHeader} />
        <CartDrawer />
        <Content template={this.props.structure.template} />
      </div>
    );
  }
}

export default CoreLayout;
