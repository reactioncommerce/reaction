import React, { Component } from "react";
import styled, { css } from "styled-components";
import styledMUI from "styled-components-mui";
import { ContainerQuery } from "react-container-query";
import MUIAppBar from "@material-ui/core/AppBar";
import MUIToolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import ProfileImage from "@reactioncommerce/components/ProfileImage/v1";
import { applyTheme } from "@reactioncommerce/components/utils";
import { Route, Switch } from "react-router";
import Sidebar from "../components/Sidebar";
import { operatorRoutes } from "../index";

// TODO: Use real data
const viewer = {
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  primaryEmailAddress: "john@doe.com"
};

const query = {
  isMobile: {
    minWidth: 0,
    maxWidth: 500
  }
};

const Container = styled.div`
  display: flex;
`;

const Main = styled.div`
  max-width: 1200px;
  flex-grow: 1;
  padding: 24px;
  transition: ${(props) =>
    (props.open
      ? "margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms"
      : "margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms")};
  margin-left: ${(props) => (props.open ? 0 : "-264px")};
`;

const AppBar = styledMUI(MUIAppBar)`
  background-color: #fafafa;
  transition: ${(props) =>
    (props.open
      ? "margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,width 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms"
      : "margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms,width 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms")};
  ${(props) => {
    if (props.open) {
      return css`
        margin-left: ${applyTheme("Sidebar.drawerWidth")};
        width: calc(100 % - ${applyTheme("Sidebar.drawerWidth")});
`;
    }
  }};
`;

const Toolbar = styled(MUIToolbar)`
  padding-right: 24px;
`;

const Grow = styled.div`
  flex-grow: 1;
`;

const BurgerMenuContainer = styled.div``;

const DrawerHeader = styled.div`
  min-height: 48px;
  @media (min-width: 600px) {
    min-height: 64px;
  }
  @media (min-width: 0px) and (orientation: landscape) {
    min-height: 48px;
  }
`;

export default class Dashboard extends Component {
  state = {
    isSidebarOpen: true
  };

  handleDrawerOpen = () => {
    this.setState({ isSidebarOpen: true });
  };

  handleDrawerClose = () => {
    this.setState({ isSidebarOpen: false });
  };

  render() {
    const { isSidebarOpen } = this.state;

    return (
      <ContainerQuery query={query}>
        {({ isMobile }) => (
          <Container>
            <AppBar elevation={0} position="absolute" open={isSidebarOpen}>
              <Toolbar>
                <BurgerMenuContainer>
                  <IconButton onClick={this.handleDrawerOpen}>
                    <FontAwesomeIcon icon={faBars} />
                  </IconButton>
                </BurgerMenuContainer>
                <Grow />
                <ProfileImage size={40} viewer={viewer} />
              </Toolbar>
            </AppBar>
            <Sidebar
              isMobile={isMobile}
              isSidebarOpen={isSidebarOpen}
              handleDrawerOpen={this.handleDrawerOpen}
              handleDrawerClose={this.handleDrawerClose}
              routes={operatorRoutes}
            />
            <Main open={isSidebarOpen}>
              <DrawerHeader />
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
            </Main>
          </Container>
        )}
      </ContainerQuery>
    );
  }
}
