import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import Header from "./header";
import CartDrawer from "./cartDrawer";
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
