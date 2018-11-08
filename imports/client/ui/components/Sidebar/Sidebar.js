import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import styled from "styled-components";
import styledMUI from "styled-components-mui";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import MUIListItemText from "@material-ui/core/ListItemText";
import MUIDrawer from "@material-ui/core/Drawer";
import MUIIconButton from "@material-ui/core/IconButton";
import {
  applyTheme,
  addTypographyStyles
} from "@reactioncommerce/components/utils";
import { Typography } from "@material-ui/core";
import { Translation } from "/imports/plugins/core/ui/client/components";

const IconButton = styled(MUIIconButton)``;

const Drawer = styledMUI(MUIDrawer, { paper: "Paper" })`
  width: ${applyTheme("Sidebar.drawerWidth")};
  flex-shrink: 0;
  .Paper {
    background-color: ${applyTheme("Sidebar.menuBarBackgroundColor")};
    width: ${applyTheme("Sidebar.drawerWidth")};
  }
`;

const ListItemText = styledMUI(MUIListItemText)`
  ${addTypographyStyles("SidebarMenu", "bodyText")};
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;
  justify-content: flex-end;
  min-height: 56px;
  @media (min-width: 600px) {
    min-height: 64px;
  }
  @media (min-width: 0px) and (orientation: landscape) {
    min-height: 48px;
  }
`;

const CompanyName = styledMUI(Typography)`
  ${addTypographyStyles("SidebarMenu", "titleText")};
  color: ${applyTheme("Sidebar.companyNameColor")};
  border-bottom: solid 5px ${applyTheme("Sidebar.companyNameBorderBottom")};
  width: fit-content;
  margin: 20px auto;
  font-weight: bold;
`;

export default class Sidebar extends Component {
  static propTypes = {
    handleDrawerClose: PropTypes.func.isRequired,
    handleDrawerOpen: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
    isSidebarOpen: PropTypes.bool.isRequired,
    routes: PropTypes.array
  }

  handleDrawerOpen = () => {
    this.props.handleDrawerOpen();
  };

  handleDrawerClose = () => {
    this.props.handleDrawerClose();
  };

  renderMenuItems = () => {
    const { routes } = this.props;

    return (
      <List>
        {
          routes.map((route) => (
            <Link to={`/operator${route.path}`} key={route.path}>
              <ListItem button>
                <ListItemIcon>
                  {React.createElement(route.sidebarIconComponent)}
                </ListItemIcon>
                <ListItemText disableTypography>
                  <Translation defaultValue="" i18nKey={route.sidebarI18nLabel} />
                </ListItemText>
              </ListItem>
            </Link>
          ))
        }
      </List>
    );
  }

  renderSidebarMenu = () => {
    const { isMobile, isSidebarOpen } = this.props;

    const menu = (
      <nav>
        <DrawerHeader>
          <IconButton onClick={this.handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <CompanyName variant="h5">Reaction</CompanyName>
        {this.renderMenuItems()}
      </nav>
    );

    if (isMobile) {
      return (
        <Drawer
          variant="temporary"
          anchor="left"
          open={isSidebarOpen}
          onClose={this.handleDrawerClose}
          ModalProps={
            { keepMounted: true } // Better open performance on mobile.
          }
        >
          {menu}
        </Drawer>
      );
    }
    return (
      <Drawer variant="persistent" open={isSidebarOpen}>
        {menu}
      </Drawer>
    );
  };
  render() {
    return (
      <Fragment>
        {this.renderSidebarMenu()}
      </Fragment>
    );
  }
}
