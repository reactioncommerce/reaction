import React, { Component } from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import styledMUI from "styled-components-mui";
import { ContainerQuery } from "react-container-query";
import MUIAppBar from "@material-ui/core/AppBar";
import MUIToolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
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
`;

const MainContent = styled.div`
  max-width: ${applyTheme("Layout.pageContentMaxWidth")};
  padding-bottom: ${applyTheme("Layout.pageContentPaddingBottom")};
  padding-left: ${applyTheme("Layout.pageContentPaddingLeft")};
  padding-right: ${applyTheme("Layout.pageContentPaddingRight")};
  padding-top: ${applyTheme("Layout.pageContentPaddingTop")};
  margin: 0 auto;
`;

// The reason we can't simply do `styledMUI(MUIAppBar)` here is because we're passing in isMobile and isSidebarOpen
// props for the styled-components conditionals, but React does not recognize these as valid attributes
// for DOM elements and prints warnings in the console. Someday there may be a better solution.
// See https://github.com/styled-components/styled-components/issues/305
const AppBar = styledMUI(({ children, isMobile, isSidebarOpen, ...restProps }) => (<MUIAppBar {...restProps}>{children}</MUIAppBar>))`
  background-color: ${applyTheme("Layout.pageHeaderBackgroundColor")};
  transition: ${(props) =>
    (props.isSidebarOpen && props.isMobile !== true
      ? "margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,width 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms"
      : "margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms,width 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms")};
  ${(props) => {
    if (props.isSidebarOpen && props.isMobile !== true) {
      return css`
        margin-left: ${applyTheme("Sidebar.drawerWidth")};
        width: calc(100% - ${applyTheme("Sidebar.drawerWidth")});`;
    }
    return null;
  }};
`;

const Grow = styled.div`
  flex-grow: 1;
`;

const HamburgerIconButton = styledMUI(IconButton)`
  color: ${applyTheme("Layout.burgerIconColor")};
  position: fixed;
  left: ${applyTheme("Layout.burgerIconLeft")};
  top: ${applyTheme("Layout.burgerIconTop")};
  z-index: 2000;
`;

// This is an invisible element that is needed only to push the page content down below the `AppBar`
const DrawerHeader = styled.div`
  min-height: 48px;
  @media (min-width: 600px) {
    min-height: 64px;
  }
  @media (min-width: 0px) and (orientation: landscape) {
    min-height: 48px;
  }
`;

class Dashboard extends Component {
  static propTypes = {
    components: PropTypes.shape({
      IconHamburger: CustomPropTypes.component.isRequired
    })
  };

  state = {
    isSidebarOpen: null
  };

  handleDrawerClose = () => {
    this.setState({ isSidebarOpen: false });
  };

  handleDrawerToggle = () => {
    this.setState({ isSidebarOpen: !this.state.isSidebarOpen });
  };

  render() {
    const { components: { IconHamburger } } = this.props;
    const { isSidebarOpen } = this.state;

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
              <HamburgerIconButton onClick={this.handleDrawerToggle}>
                <IconHamburger />
              </HamburgerIconButton>
              <AppBar elevation={0} position="fixed" isMobile={isMobile} isSidebarOpen={isSidebarOpen}>
                <MUIToolbar>
                  <Grow />
                  <ProfileImageWithData size={40} />
                </MUIToolbar>
              </AppBar>
              <Sidebar
                isMobile={isMobile}
                isSidebarOpen={isSidebarOpen || false}
                onDrawerClose={this.handleDrawerClose}
                routes={operatorRoutes}
              />
              <Main isMobile={isMobile} isSidebarOpen={isSidebarOpen}>
                <DrawerHeader />
                <MainContent>
                  <Switch>
                    {
                      operatorRoutes.map((route) => (
                        <Route
                          key={route.path}
                          path={`/operator${route.path}`}
                          component={route.mainComponent}
                        />
                      ))
                    }
                  </Switch>
                </MainContent>
              </Main>
            </Container>
          );
        }}
      </ContainerQuery>
    );
  }
}

export default withComponents(Dashboard);
