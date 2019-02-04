import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import classNames from "classnames";
import styled, { injectGlobal } from "styled-components";
import { ContainerQuery } from "react-container-query";
import withStyles from "@material-ui/core/styles/withStyles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { applyTheme, CustomPropTypes } from "@reactioncommerce/components/utils";
import { withComponents } from "@reactioncommerce/components-context";
import { Route, Switch } from "react-router";
import ProfileImageWithData from "../components/ProfileImageWithData";
import Sidebar from "../components/Sidebar";
import { operatorRoutes } from "../index";

const query = {
  isMobile: {
    minWidth: 0,
    maxWidth: 600
  }
};

// Remove the 10px fontSize from the html element as it affects fonts that rely on rem
injectGlobal`
  html {
    font-size: inherit;
  }
`;

const Container = styled.div`
  display: flex;
`;

// The reason we can't simply do `styled.div` here is because we're passing in isMobile and isSidebarOpen
// props for the styled-components conditionals, but React does not recognize these as valid attributes
// for DOM elements and prints warnings in the console. Someday there may be a better solution.
// See https://github.com/styled-components/styled-components/issues/305
const Main = styled(({ children, isMobile, isSidebarOpen, ...divProps }) => (<div {...divProps}>{children}</div>))`
  width: 100vw;
  background-color: ${applyTheme("Layout.pageBackgroundColor")};
  flex-grow: 1;
  transition: ${(props) =>
    (props.isSidebarOpen && props.isMobile !== true
      ? "padding 225ms cubic-bezier(0, 0, 0.2, 1) 0ms"
      : "padding 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms")};
  padding-left: ${(props) => (props.isSidebarOpen && props.isMobile === false ? "280px" : 0)};
  padding-bottom: ${applyTheme("Layout.pageContentPaddingBottom")};
  padding-right: ${applyTheme("Layout.pageContentPaddingRight")};
  padding-top: ${applyTheme("Layout.pageContentPaddingTop")};
  margin: 0 auto;
`;

const MainContent = styled.div`
  max-width: ${applyTheme("Layout.pageContentMaxWidth")};
  padding-bottom: ${applyTheme("Layout.pageContentPaddingBottom")};
  padding-left: ${applyTheme("Layout.pageContentPaddingLeft")};
  padding-right: ${applyTheme("Layout.pageContentPaddingRight")};
  padding-top: ${applyTheme("Layout.pageContentPaddingTop")};
  margin: 0 auto;
`;

const MainFullWidth = styled.div`
  width: 100vw;
  background-color: ${applyTheme("Layout.pageBackgroundColor")};
  flex-grow: 1;
  transition: ${(props) =>
    (props.isSidebarOpen && props.isMobile !== true
      ? "padding 225ms cubic-bezier(0, 0, 0.2, 1) 0ms"
      : "padding 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms")};
  padding-left: ${(props) => (props.isSidebarOpen && props.isMobile === false ? "280px" : 0)};
  padding-top: ${applyTheme("Layout.pageContentPaddingTop")};
`;

const Grow = styled.div`
  flex-grow: 1;
`;

const styles = (theme) => ({
  leftSidebarOpen: {
    paddingLeft: 280 + (theme.spacing.unit * 2)
  }
});

class Dashboard extends Component {
  static propTypes = {
    components: PropTypes.shape({
      IconHamburger: CustomPropTypes.component.isRequired
    })
  };

  state = {
    isSidebarOpen: true
  };

  handleDrawerClose = () => {
    this.setState({ isSidebarOpen: false });
  };

  handleDrawerToggle = () => {
    this.setState({ isSidebarOpen: !this.state.isSidebarOpen });
  };

  render() {
    const { classes } = this.props;
    const { isSidebarOpen } = this.state;
    const uiState = {
      isLeftDrawerOpen: isSidebarOpen
    };

    const toolbarClassName = classNames({
      [classes.leftSidebarOpen]: uiState.isLeftDrawerOpen
    });

    return (
      <ContainerQuery query={query}>
        {({ isMobile }) => {
          // Sidebar should be initially open on desktop but not on mobile.
          // isMobile is initially undefined, so need the explicit `=== false` check
          if (isSidebarOpen === null && isMobile === false) {
            // React logs warnings when using `setState` in render, but in this
            // case it works fine and I don't see any other way given how `ContainerQuery`
            // works. Wrapping in `setTimeout` fools React into not printing the warning.
            setTimeout(() => {
              this.setState({ isSidebarOpen: true });
            }, 0);
          }

          return (
            <Container>
              <AppBar position="fixed">
                <Toolbar className={toolbarClassName}>
                  <Grow />
                  <ProfileImageWithData size={40} />
                </Toolbar>
              </AppBar>
              <Sidebar
                isMobile={isMobile}
                isSidebarOpen={true}
                onDrawerClose={this.handleDrawerClose}
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
                            <MainFullWidth isMobile={isMobile} isSidebarOpen={isSidebarOpen}>
                              <route.mainComponent uiState={uiState} {...props} />;
                            </MainFullWidth>
                          );
                        }

                        const LayoutComponent = route.layoutComponent || Main;

                        return (
                          <LayoutComponent isMobile={isMobile} isSidebarOpen={isSidebarOpen}>
                            <route.mainComponent uiState={uiState} {...props} />
                          </LayoutComponent>
                        );
                      }}
                    />
                  ))
                }
              </Switch>
            </Container>
          );
        }}
      </ContainerQuery>
    );
  }
}

export default compose(
  withComponents,
  withStyles(styles, { name: "RuiDashboard" })
)(Dashboard);
