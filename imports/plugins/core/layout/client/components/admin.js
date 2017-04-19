import React, { Component, PropTypes } from "react";
import classnames from "classnames";


// TODO: make part of ReactionLayout
import Header from "./header";
import CartDrawer from "./cartDrawer";
// import QuickMenu from "./quickMenu";
// import Toolbar from "./toolbar";
import { Content } from "./";


class AdminView extends Component {
  static propTypes = {
    actionViewIsOpen: PropTypes.bool,
    data: PropTypes.object
  }

  render() {
    const pageClassName = classnames({
      "page": true,
      "show-settings": this.props.actionViewIsOpen
    });

    /*
    <QuickMenu buttons={this.props.buttons} />
     */

    return (
      <div className={pageClassName} id="reactionAppContainer">
        <Header template={this.props.layoutHeader} />
        <CartDrawer />
        <Content template={this.props.template} />
      </div>
    );
  }
}

export default AdminView;
