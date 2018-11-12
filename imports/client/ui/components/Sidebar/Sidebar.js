import React, { Component, Fragment } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import styled from "styled-components";
import styledMUI from "styled-components-mui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import MUIList from "@material-ui/core/List";
import MUIListItem from "@material-ui/core/ListItem";
import MUIListItemIcon from "@material-ui/core/ListItemIcon";
import MUIDivider from "@material-ui/core/Divider";
import MUIListItemText from "@material-ui/core/ListItemText";
import MUIDrawer from "@material-ui/core/Drawer";
import MUIIconButton from "@material-ui/core/IconButton";
import {
  applyTheme,
  addTypographyStyles
} from "@reactioncommerce/components/utils";
import { Translation } from "/imports/plugins/core/ui/client/components";

const IconButton = styledMUI(MUIIconButton)`
  margin-left: auto;
`;

const Drawer = styledMUI(MUIDrawer, { paper: "Paper" })`
  width: ${applyTheme("Sidebar.drawerWidth")};
  flex-shrink: 0;
  .Paper {
    background-color: ${applyTheme("Sidebar.menuBarBackgroundColor")};
    width: ${applyTheme("Sidebar.drawerWidth")};
  }
`;

const Divider = styledMUI(MUIDivider)`
  width: ${applyTheme("Sidebar.iconBarWidth")};
  padding-top: 10px;
  padding-bottom: 10px;
  background-color: ${applyTheme("Sidebar.iconBarBackgroundColor")};
`;

const List = styledMUI(MUIList)`
  padding-top: 0;
`;

const ListItem = styledMUI(MUIListItem)`
  padding: 0;
`;

const LowerDarkBlueBand = styled.div`
  background-color: ${applyTheme("Sidebar.iconBarBackgroundColor")};
  width: ${applyTheme("Sidebar.iconBarWidth")};
  height: 100vh;
`;

const ListItemIcon = styled(MUIListItemIcon)`
  width: ${applyTheme("Sidebar.iconBarWidth")};
  background-color: ${applyTheme("Sidebar.iconBarBackgroundColor")};
  padding-top: ${applyTheme("Sidebar.ListItemIconPaddingTop")};
  padding-right: ${applyTheme("Sidebar.ListItemIconPaddingRight")};
  padding-bottom: ${applyTheme("Sidebar.ListItemIconPaddingBottom")};
  padding-left: ${applyTheme("Sidebar.ListItemIconPaddingLeft")};
`;

const ListItemText = styledMUI(MUIListItemText)`
  ${addTypographyStyles("SidebarMenu", "bodyText")};
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px 0 0;
  min-height: 48px;
  @media (min-width: 600px) {
    min-height: 64px;
  }
  @media (min-width: 0px) and (orientation: landscape) {
    min-height: 48px;
  }
`;

const AppBarDarkBlueBand = styled.div`
  background-color: ${applyTheme("Sidebar.iconBarBackgroundColor")};
  height: 48px;
  width: ${applyTheme("Sidebar.iconBarWidth")};
  @media (min-width: 600px) {
    min-height: 64px;
  }
`;

const CompanyBranding = styled.div`
  display: flex;
  align-items: center;
`;

const UpperDarkBlueBand = styled.div`
  width: ${applyTheme("Sidebar.iconBarWidth")};
  height: 90px;
  background-color: ${applyTheme("Sidebar.iconBarBackgroundColor")};
`;

const CompanyName = styled.div`
  ${addTypographyStyles("SidebarMenu", "titleText")};
  color: ${applyTheme("Sidebar.companyNameColor")};
  padding-bottom: 20px;
  font-weight: bold;
  margin: 0 auto;
`;

const activeClassName = "nav-item-active";
const Link = styled(NavLink).attrs({
  activeClassName
})`
 &.${activeClassName} span {
   color: ${applyTheme("Sidebar.activeMenuItemColor")};
 }
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

  renderNavigationMenuItems = (settings = false) => {
    const { routes } = this.props;
    const filteredRoutes = settings ?
      routes.filter(({ isNavigationLink, isSetting }) => isNavigationLink && isSetting) :
      routes.filter(({ isNavigationLink, isSetting }) => isNavigationLink && !isSetting);

    return (
      <Fragment>
        {
          filteredRoutes.map((route) => (
            <Link to={`/operator${route.path}`} activeClassName={activeClassName} key={route.path}>
              <ListItem button>
                <ListItemIcon>
                  {React.cloneElement(route.sidebarIconComponent, { color: "#5d8ea9", size: "lg" })}
                </ListItemIcon>
                <ListItemText disableTypography>
                  <Translation defaultValue="" i18nKey={route.sidebarI18nLabel} />
                </ListItemText>
              </ListItem>
            </Link>
          ))
        }
      </Fragment>
    );
  }

  renderSidebarMenu = () => {
    const { isMobile, isSidebarOpen } = this.props;

    const menu = (
      <nav>
        <DrawerHeader>
          <AppBarDarkBlueBand />
          <IconButton onClick={this.handleDrawerClose}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </IconButton>
        </DrawerHeader>
        <CompanyBranding>
          <UpperDarkBlueBand />
          <CompanyName variant="h5">Reaction</CompanyName>
        </CompanyBranding>
        <List>
          {this.renderNavigationMenuItems()}
          <Divider component="li" />
          {this.renderNavigationMenuItems(true)}
          <LowerDarkBlueBand />
        </List>
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
