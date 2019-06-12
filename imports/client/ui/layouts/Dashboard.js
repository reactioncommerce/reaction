import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { injectGlobal } from "styled-components";
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth, { isWidthDown } from "@material-ui/core/withWidth";
import { CustomPropTypes } from "@reactioncommerce/components/utils";
import { withComponents } from "@reactioncommerce/components-context";
import { Route, Switch } from "react-router";
import PrimaryAppBar from "../components/PrimaryAppBar/PrimaryAppBar";
import ProfileImageWithData from "../components/ProfileImageWithData";
import Sidebar from "../components/Sidebar";
import { operatorRoutes } from "../index";
import { UIContext } from "../context/UIContext";
import ContentViewFullLayout from "./ContentViewFullLayout";
import ContentViewStandardayout from "./ContentViewStandardLayout";

// Remove the 10px fontSize from the html element as it affects fonts that rely on rem
injectGlobal`
  html {
    font-size: inherit;
  }
`;

const styles = (theme) => ({
  container: {
    display: "flex"
  },
  leftSidebarOpen: {
    paddingLeft: 280 + (theme.spacing.unit * 2)
  }
});

class Dashboard extends Component {
  static propTypes = {
    classes: PropTypes.object,
    components: PropTypes.shape({
      IconHamburger: CustomPropTypes.component.isRequired
    }),
    width: PropTypes.number
  };

  constructor(props) {
    super(props);

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      isPrimarySidebarOpen: true,
      onClosePrimarySidebar: this.onClosePrimarySidebar,
      onTogglePrimarySidebar: this.onTogglePrimarySidebar
    };
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
    const { isPrimarySidebarOpen } = this.state;

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
                        <ContentViewFullLayout isMobile={isMobile} isSidebarOpen={isPrimarySidebarOpen}>
                          <route.mainComponent uiState={this.state} {...props} />
                        </ContentViewFullLayout>
                      );
                    }

                    const LayoutComponent = route.layoutComponent || ContentViewStandardayout;

                    return (
                      <LayoutComponent isMobile={isMobile} isSidebarOpen={isPrimarySidebarOpen}>
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
  withWidth({ initialWidth: "md" }),
  withStyles(styles, { name: "RuiDashboard" })
)(Dashboard);
