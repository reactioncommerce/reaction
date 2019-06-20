import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth, { isWidthDown } from "@material-ui/core/withWidth";
import { CustomPropTypes } from "@reactioncommerce/components/utils";
import { withComponents } from "@reactioncommerce/components-context";
import { Route, Switch } from "react-router";
import OperatorLanding from "/imports/plugins/core/dashboard/client/components/OperatorLanding";
import PrimaryAppBar from "../components/PrimaryAppBar/PrimaryAppBar";
import ProfileImageWithData from "../components/ProfileImageWithData";
import Sidebar from "../components/Sidebar";
import { operatorRoutes } from "../index";
import { UIContext } from "../context/UIContext";
import ContentViewFullLayout from "./ContentViewFullLayout";
import ContentViewStandardLayout from "./ContentViewStandardLayout";

const styles = (theme) => ({
  "@global": {
    html: {
      // Remove the 10px fontSize from the html element as it affects fonts that rely on rem
      fontSize: "inherit"
    }
  },
  "container": {
    display: "flex"
  },
  "leftSidebarOpen": {
    ...theme.mixins.leadingPaddingWhenPrimaryDrawerIsOpen
  }
});

class Dashboard extends Component {
  static propTypes = {
    classes: PropTypes.object,
    components: PropTypes.shape({
      IconHamburger: CustomPropTypes.component.isRequired
    }),
    width: PropTypes.string
  };

  constructor(props) {
    super(props);

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      isMobile: false,
      isPrimarySidebarOpen: true,
      onClosePrimarySidebar: this.onClosePrimarySidebar,
      onTogglePrimarySidebar: this.onTogglePrimarySidebar
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { width } = this.props;
    const isMobile = isWidthDown("sm", width);

    if (prevState.isMobile !== isMobile) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isMobile
      });
    }

    if (!isMobile && prevState.isPrimarySidebarOpen === false) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isPrimarySidebarOpen: true
      });
    }
  }

  onTogglePrimarySidebar = () => {
    this.setState((state) => ({
      isPrimarySidebarOpen: !state.isPrimarySidebarOpen
    }));
  };

  onClosePrimarySidebar = () => {
    this.setState({ isPrimarySidebarOpen: false });
  };

  render() {
    const { classes, width } = this.props;
    const isMobile = isWidthDown("sm", width);

    return (
      <UIContext.Provider value={this.state}>
        <div className={classes.container}>
          <PrimaryAppBar>
            <ProfileImageWithData size={40} />
          </PrimaryAppBar>
          <Sidebar
            isMobile={isMobile}
            isSidebarOpen={this.state.isPrimarySidebarOpen}
            setIsSidebarOpen={(value) => {
              this.setState({ isPrimarySidebarOpen: value });
            }}
            onDrawerClose={this.state.onClosePrimarySidebar}
            routes={operatorRoutes}
          />
          <Switch>
            {
              operatorRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={`/operator${route.path}`}
                  render={(props) => {
                    // If the layout component is explicitly null
                    if (route.layoutComponent === null) {
                      return (
                        <ContentViewFullLayout isSidebarOpen={!isMobile}>
                          <route.mainComponent uiState={this.state} {...props} />
                        </ContentViewFullLayout>
                      );
                    }

                    const LayoutComponent = route.layoutComponent || ContentViewStandardLayout;

                    return (
                      <LayoutComponent isSidebarOpen={!isMobile}>
                        <route.mainComponent uiState={this.state} {...props} />
                      </LayoutComponent>
                    );
                  }}
                />
              ))
            }
            {/*
            Add a special route for the landing page.
            This must go last, as it will override other
            routes if it is placed before them.
            This is essentially a 404 in addition to a landing page.
            */}
            <Route
              key="operatorLandingPage"
              path="/operator"
              render={(props) => (
                <ContentViewFullLayout isSidebarOpen={!isMobile}>
                  <OperatorLanding uiState={this.state} {...props} />
                </ContentViewFullLayout>
              )}
            />
          </Switch>
        </div>
      </UIContext.Provider>
    );
  }
}

export default compose(
  withComponents,
  withWidth({ initialWidth: "md" }),
  withStyles(styles, { name: "RuiDashboard" })
)(Dashboard);
