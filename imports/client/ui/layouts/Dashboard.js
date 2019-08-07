import React, { Component } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { i18next } from "/client/api";
import { compose } from "recompose";
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth, { isWidthDown } from "@material-ui/core/withWidth";
import { CustomPropTypes } from "@reactioncommerce/components/utils";
import { withComponents } from "@reactioncommerce/components-context";
import { Route, Switch } from "react-router";
import { withRouter } from "react-router-dom";
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
    location: PropTypes.object,
    width: PropTypes.string
  };

  constructor(props) {
    super(props);

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      isDetailDrawerOpen: false,
      isMobile: false,
      isPrimarySidebarOpen: true,
      onClosePrimarySidebar: this.onClosePrimarySidebar,
      onTogglePrimarySidebar: this.onTogglePrimarySidebar,
      onCloseDetailDrawer: this.onCloseDetailDrawer,
      onToggleDetailDrawer: this.onToggleDetailDrawer
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { width, location } = this.props;
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

    // Close the detail drawer on route change
    if (location.pathname !== prevProps.location.pathname) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isDetailDrawerOpen: false
      });
    }
  }

  onTogglePrimarySidebar = () => {
    this.setState((state) => ({
      isPrimarySidebarOpen: !state.isPrimarySidebarOpen
    }));
  };

  onToggleDetailDrawer = () => {
    this.setState((state) => ({
      isDetailDrawerOpen: !state.isDetailDrawerOpen
    }));
  };

  onCloseDetailDrawer = () => {
    this.setState({ isDetailDrawerOpen: false });
  };

  onClosePrimarySidebar = () => {
    this.setState({ isPrimarySidebarOpen: false });
  };

  render() {
    const { classes, width } = this.props;
    const { isDetailDrawerOpen, isPrimarySidebarOpen } = this.state;
    const isMobile = isWidthDown("sm", width);

    return (
      <UIContext.Provider value={this.state}>
        <div className={classes.container}>
          <PrimaryAppBar>
            <ProfileImageWithData size={40} />
          </PrimaryAppBar>
          <Sidebar
            isMobile={isMobile}
            isSidebarOpen={isPrimarySidebarOpen && !isDetailDrawerOpen}
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
                  exact
                  key={route.path}
                  path={`/operator${route.path}`}
                  render={(props) => {
                    const title = i18next.t(route.sidebarI18nLabel, { defaultValue: "Reaction Admin" });
                    // If the layout component is explicitly null
                    if (route.layoutComponent === null) {
                      return (
                        <ContentViewFullLayout
                          isLeadingDrawerOpen={!isMobile}
                          isTrailingDrawerOpen={isDetailDrawerOpen && !isMobile}
                        >
                          <Helmet title={title} />
                          <route.mainComponent uiState={this.state} {...props} />
                        </ContentViewFullLayout>
                      );
                    }

                    const LayoutComponent = route.layoutComponent || ContentViewStandardLayout;

                    return (
                      <LayoutComponent
                        isLeadingDrawerOpen={!isMobile}
                        isTrailingDrawerOpen={isDetailDrawerOpen && !isMobile}
                      >
                        <Helmet title={title} />
                        <route.mainComponent uiState={this.state} {...props} />
                      </LayoutComponent>
                    );
                  }}
                />
              ))
            }
          </Switch>
        </div>
      </UIContext.Provider>
    );
  }
}

export default compose(
  withComponents,
  withRouter,
  withWidth({ initialWidth: "md" }),
  withStyles(styles, { name: "RuiDashboard" })
)(Dashboard);
