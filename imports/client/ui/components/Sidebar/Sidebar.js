import React, { Component, Fragment } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import styled from "styled-components";
import styledMUI from "styled-components-mui";
import MUIList from "@material-ui/core/List";
import MUIListItem from "@material-ui/core/ListItem";
import MUIListItemIcon from "@material-ui/core/ListItemIcon";
import MUIDivider from "@material-ui/core/Divider";
import MUIListItemText from "@material-ui/core/ListItemText";
import MUIDrawer from "@material-ui/core/Drawer";
import ShopLogoWithData from "../ShopLogoWithData";
import {
  applyTheme,
  addTypographyStyles
} from "@reactioncommerce/components/utils";
import { Translation } from "/imports/plugins/core/ui/client/components";

const Drawer = styledMUI(MUIDrawer, { paper: "Paper" })`
  width: ${applyTheme("Sidebar.drawerWidth")};
  flex-shrink: 0;
  .Paper {
    width: ${applyTheme("Sidebar.drawerWidth")};
  }
`;

const Divider = styledMUI(MUIDivider)`
  padding-top: ${applyTheme("Sidebar.dividerHeight")};;
  background-color: transparent;
`;

const List = styledMUI(MUIList)`
  padding-top: 0;
  overflow: auto;
`;

const ListItem = styledMUI(MUIListItem)`
  padding: 0;
`;

const ListItemIcon = styledMUI(MUIListItemIcon)`
  color: ${applyTheme("Sidebar.iconColor")};
  justify-content: ${applyTheme("Sidebar.listItemIconHorizontalAlign")};
  padding-top: ${applyTheme("Sidebar.listItemIconPaddingTop")};
  padding-right: ${applyTheme("Sidebar.listItemIconPaddingRight")};
  padding-bottom: ${applyTheme("Sidebar.listItemIconPaddingBottom")};
  padding-left: ${applyTheme("Sidebar.listItemIconPaddingLeft")};
  width: ${applyTheme("Sidebar.iconBarWidth")};

  /*
   * FontAwesome icons respect this font-size to determine icon height while other
   * SVGs should be designed to be 100% height. Generally you'll want listItemIconMaxHeight
   * to be listItemIconFontSize + listItemIconPaddingTop + listItemIconPaddingBottom
   */
  font-size: ${applyTheme("Sidebar.listItemIconFontSize")};
  max-height: ${applyTheme("Sidebar.listItemIconMaxHeight")};

  /* remove margin from default MUI theme */
  margin-right: 0;
`;

const ListItemText = styledMUI(MUIListItemText)`
  ${addTypographyStyles("SidebarMenu", "bodyText")};
`;

const LogoArea = styled.div`
  display: flex;
  justify-content: ${applyTheme("Sidebar.logoHorizontalAlign")};
  padding-top: ${applyTheme("Sidebar.logoPaddingTop")};
  padding-bottom: ${applyTheme("Sidebar.logoPaddingBottom")};
  padding-left: ${applyTheme("Sidebar.logoPaddingLeft")};
  padding-right: ${applyTheme("Sidebar.logoPaddingRight")};
  margin-left: ${applyTheme("Sidebar.iconBarWidth")};
`;

const StyledNav = styled.nav`
  background: ${applyTheme("Sidebar.menuBarBackground")};
  display: flex;
  flex-direction: column;
  height: 100%;
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
    isMobile: PropTypes.bool,
    isSidebarOpen: PropTypes.bool.isRequired,
    onDrawerClose: PropTypes.func.isRequired,
    routes: PropTypes.array
  }

  renderNavigationMenuItems(settings = false) {
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
                  <route.SidebarIconComponent />
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

  render() {
    const { isMobile, isSidebarOpen, onDrawerClose } = this.props;

    const menu = (
      <StyledNav>
        <LogoArea>
          <ShopLogoWithData />
        </LogoArea>
        <List>
          {this.renderNavigationMenuItems()}
          <Divider component="li" />
          {this.renderNavigationMenuItems(true)}
        </List>
      </StyledNav>
    );

    if (isMobile) {
      return (
        <Drawer
          variant="temporary"
          anchor="left"
          open={isSidebarOpen}
          onClose={onDrawerClose}
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
  }
}
