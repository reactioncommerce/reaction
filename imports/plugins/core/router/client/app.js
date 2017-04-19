import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import { Loading } from "/imports/plugins/core/ui/client/components";
import ToolbarContainer from "/imports/plugins/core/dashboard/client/containers/toolbarContainer";
import Toolbar from "/imports/plugins/core/dashboard/client/components/toolbar";
import { ActionViewContainer } from "/imports/plugins/core/dashboard/client/containers";
import { ActionView } from "/imports/plugins/core/dashboard/client/components";

const ConnectedToolbarComponent = ToolbarContainer(Toolbar);
const ConnectedAdminViewComponent = ActionViewContainer(ActionView);

const styles = {
  customerApp: {
    width: "100vw"
  },
  adminApp: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    overflow: "hidden"
  },
  adminContentContainer: {
    flex: "1 1 auto",
    height: "100vh"
  },
  adminContainer: {
    display: "flex",
    flex: "1 1 auto"
  }
};

class App extends Component {
  static propTypes = {
    children: PropTypes.node,
    hasDashboardAccess: PropTypes.bool
  }

  get isAdminApp() {
    return this.props.hasDashboardAccess;
  }

  renderAdminApp() {
    const pageClassName = classnames({
      "admin": true,
      "page": true,
      "show-settings": this.props.isActionViewOpen
    });

    return (
      <div
        style={styles.adminApp}
      >
        <div className={pageClassName} id="reactionAppContainer" style={styles.adminContentContainer}>
          <div className="reaction-toolbar">
            <ConnectedToolbarComponent data={this.props} />
          </div>
          <div>
            {this.props.children}
          </div>
        </div>
        {this.props.hasDashboardAccess && <ConnectedAdminViewComponent />}
      </div>
    );
  }

  render() {
    const pageClassName = classnames({
      // "admin": true,
      // "show-settings": this.props.isActionViewOpen
    });

    if (this.isAdminApp) {
      return this.renderAdminApp();
    }

    return (
      <div
        className={pageClassName}
        style={styles.customerApp}
      >
        {this.props.children}
      </div>
    );
  }
}

function composer(props, onData) {
  onData(null, {
    isActionViewOpen: Reaction.isActionViewOpen(),
    hasDashboardAccess: Reaction.hasDashboardAccess()
  });
}

export default composeWithTracker(composer, Loading)(App);
