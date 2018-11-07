import React, { Component, Fragment } from "react";
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

const drawerWidth = "240px";

const IconButton = styled(MUIIconButton)``;

const Drawer = styledMUI((props) => (
  <MUIDrawer {...props} classes={{ paper: "paper" }} />
))`
  width: ${drawerWidth};
  flex-shrink: 0;
  & .paper {
    background-color: ${applyTheme("Sidebar.menuBarBackgroundColor")};
    width: ${drawerWidth};
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
  color: ${applyTheme("Sidebar.companyNameColor")};
  border-bottom: solid 5px ${applyTheme("Sidebar.companyNameBorderBottom")};
  width: fit-content;
  margin: 20px auto;
`;

export default class SideBar extends Component {
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
            <ListItem button key={route.path}>
              <ListItemIcon>
                {React.createElement(route.sidebarIconComponent, {})}
              </ListItemIcon>
              <ListItemText>
                <Translation defaultValue="Shipping" i18nKey={"admin.dashboard.shippingLabel"} />
              </ListItemText>
            </ListItem>
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
          <CompanyName variant="h5">Reaction</CompanyName>
          <IconButton onClick={this.handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
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
