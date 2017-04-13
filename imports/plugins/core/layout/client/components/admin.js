import React, { Component, PropTypes } from "react";
import classnames from "classnames";


// TODO: make part of ReactionLayout
import Header from "./header";
import CartDrawer from "./cartDrawer";
// import QuickMenu from "./quickMenu";
// import Toolbar from "./toolbar";
import { Content } from "./";


import ToolbarContainer from "/imports/plugins/core/dashboard/client/containers/toolbarContainer";
import Toolbar from "/imports/plugins/core/dashboard/client/components/toolbar";
import { ActionViewContainer } from "/imports/plugins/core/dashboard/client/containers";
import { ActionView } from "/imports/plugins/core/dashboard/client/components";


const ConnectedToolbarComponent = ToolbarContainer(Toolbar)

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
      <div style={{display: "flex", flex: "1 1 auto"}}>
        <div
          className={pageClassName}
          id="reactionAppContainer"
        >
          <div className="reaction-toolbar">
            {<ConnectedToolbarComponent data={this.props} />}
          </div>
          <Header template={this.props.layoutHeader} />
          <CartDrawer />
          <Content template={this.props.template} />
        </div>
        {ActionViewContainer(ActionView)}
      </div>
    );
  }
}

export default AdminView;
