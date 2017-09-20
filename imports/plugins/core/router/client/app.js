import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Switch } from "react-router-dom";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction, Router } from "/client/api";
import ToolbarContainer from "/imports/plugins/core/dashboard/client/containers/toolbarContainer";
import Toolbar from "/imports/plugins/core/dashboard/client/components/toolbar";
import { ActionViewContainer, PackageListContainer } from "/imports/plugins/core/dashboard/client/containers";
import { ActionView, ShortcutBar } from "/imports/plugins/core/dashboard/client/components";

const ConnectedToolbarComponent = ToolbarContainer(Toolbar);
const ConnectedAdminViewComponent = ActionViewContainer(ActionView);
const ConnectedShortcutBarContainer = PackageListContainer(ShortcutBar);

const styles = {
  customerApp: {
    width: "100%"
  },
  adminApp: {
    width: "100%",
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
  },
  scrollableContainer: {
    overflow: "auto"
  }
};


const handleViewContextChange = (event, value) => {
  Reaction.setUserPreferences("reaction-dashboard", "viewAs", value);

  if (Reaction.isPreview() === true) {
    // Save last action view state
    const saveActionViewState = Reaction.getActionView();
    Reaction.setUserPreferences("reaction-dashboard", "savedActionViewState", saveActionViewState);

    // hideActionView during isPreview === true
    Reaction.hideActionView();
  }
};

const handleKeyDown = (event) => {
  if (event.altKey && event.keyCode === 69) { // Switch edit mode
    const userWas = Reaction.getUserPreferences("reaction-dashboard", "viewAs", "customer");
    const userIs = userWas === "customer" ? "administrator" : "customer";
    handleViewContextChange(event, userIs);
  }
};

class App extends Component {
  static propTypes = {
    children: PropTypes.node,
    currentRoute: PropTypes.object.isRequired,
    hasDashboardAccess: PropTypes.bool,
    isActionViewOpen: PropTypes.bool
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

    const currentRoute = this.props.currentRoute;
    const routeOptions = currentRoute.route && currentRoute.route.options || {};
    const routeData = routeOptions && currentRoute.route.options.structure || {};

    return (
      <div
        style={styles.adminApp}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className={pageClassName} id="reactionAppContainer" style={styles.adminContentContainer}>
          <div className="reaction-toolbar">
            <ConnectedToolbarComponent handleViewContextChange={handleViewContextChange} data={routeData} />
          </div>
          <div style={styles.scrollableContainer}>
            <Switch>
              {this.props.children}
            </Switch>
          </div>
        </div>
        {this.props.hasDashboardAccess && <ConnectedAdminViewComponent />}
        {this.props.hasDashboardAccess && <ConnectedShortcutBarContainer />}
      </div>
    );
  }

  render() {
    const pageClassName = classnames({
      "admin": true,
      "show-settings": this.props.isActionViewOpen
    });

    const currentRoute = this.props.currentRoute;
    const layout = currentRoute && currentRoute.route && currentRoute.route.options &&  currentRoute.route.options.layout;

    if (this.isAdminApp && layout !== "printLayout") {
      return this.renderAdminApp();
    }

    return (
      <div
        className={pageClassName}
        style={styles.customerApp}
      >
        <Switch>
          {this.props.children}
        </Switch>
      </div>
    );
  }
}

function composer(props, onData) {
  onData(null, {
    isActionViewOpen: Reaction.isActionViewOpen(),
    hasDashboardAccess: Reaction.hasDashboardAccessForAnyShop(),
    currentRoute: Router.current()
  });
}

export default composeWithTracker(composer)(App);
