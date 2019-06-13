import React from "react";
import { compose, withState } from "recompose";
import { NavLink, withRouter } from "react-router-dom";
import classNames from "classnames";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Collapse from "@material-ui/core/Collapse";
import Fab from "@material-ui/core/Fab";
import Hidden from "@material-ui/core/Hidden";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Drawer from "@material-ui/core/Drawer";
import withStyles from "@material-ui/core/styles/withStyles";
import SettingsIcon from "mdi-material-ui/Settings";
import CloseIcon from "mdi-material-ui/Close";
import ShopLogoWithData from "../ShopLogoWithData";
import { Translation } from "/imports/plugins/core/ui/client/components";

const activeClassName = "nav-item-active";

// Route sorting by priority. Items without a priority get pushed the bottom.
const routeSort = (routeA, routeB) => (routeA.priority || Number.MAX_SAFE_INTEGER) - (routeB.priority || Number.MAX_SAFE_INTEGER);

const styles = (theme) => ({
  icon: {
    width: 32,
    display: "flex",
    justifyContent: "center",
    color: theme.palette.colors.coolGrey300
  },
  iconActive: {
    color: theme.palette.text.active
  },
  shopLogo: {
    flex: 1,
    marginRight: theme.spacing.unit * 2
  },
  toolbar: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2
  },
  listItem: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2
  },
  listItemText: {
    paddingLeft: 0
  },
  listItemNested: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: theme.spacing.unit * 8
  },
  link: {
    [`&.${activeClassName} span`]: {
      color: theme.palette.text.secondaryActive
    },
    [`&.${activeClassName} $icon`]: {
      color: theme.palette.text.active
    }
  }
});

/**
 * Main sidebar navigation
 * @param {Object} props Component props
 * @returns {React.Component} Sidebar component
 */
function Sidebar(props) {
  const {
    classes,
    history,
    isMobile,
    isSidebarOpen,
    onDrawerClose,
    isSettingsOpen,
    setIsSettingsOpen,
    routes
  } = props;

  const primaryRoutes = routes.filter(({ isNavigationLink, isSetting }) => isNavigationLink && !isSetting).sort(routeSort);
  const settingRoutes = routes.filter(({ isNavigationLink, isSetting }) => isNavigationLink && isSetting).sort(routeSort);

  let drawerProps = {
    classes: {
      paper: classes.drawerPaper
    },
    open: true,
    variant: "persistent"
  };

  if (isMobile) {
    drawerProps = {
      variant: "temporary",
      anchor: "left",
      open: isSidebarOpen,
      onClose: onDrawerClose,
      ModalProps: {
        keepMounted: true // Better open performance on mobile.
      }
    };
  }

  return (
    <Drawer {...drawerProps}>
      <AppBar
        color="secondary"
        elevation={0}
        position="sticky"
      >
        <Toolbar className={classes.toolbar}>
          <ShopLogoWithData className={classes.shopLogo} shouldShowShopName size={32} />

          <Hidden mdUp>
            <Fab color="secondary" onClick={onDrawerClose} size="small">
              <CloseIcon />
            </Fab>
          </Hidden>

        </Toolbar>
      </AppBar>
      <List disablePadding>
        {primaryRoutes.map((route) => (
          <NavLink
            activeClassName={activeClassName}
            className={classes.link}
            to={`/operator${route.path}`}
            key={route.path}
            onClick={() => {
              setIsSettingsOpen(false);
              onDrawerClose();
            }}
          >
            <ListItem button className={classes.listItem}>
              <ListItemIcon className={classes.icon}>
                {route.SidebarIconComponent && <route.SidebarIconComponent />}
              </ListItemIcon>
              <ListItemText
                className={classes.listItemText}
                primaryTypographyProps={{
                  color: "textSecondary",
                  variant: "body1"
                }}
              >
                <Translation defaultValue="" i18nKey={route.sidebarI18nLabel} />
              </ListItemText>
            </ListItem>
          </NavLink>
        ))}

        <ListItem
          button
          className={classes.listItem}
          onClick={() => {
            // Push the first setting route when opened, but not on mobile
            if (!isSettingsOpen && !isMobile) {
              const [firstRoute] = settingRoutes;

              if (firstRoute) {
                history.push(`/operator${firstRoute.path}`);
              }
            }
            setIsSettingsOpen(!isSettingsOpen);
          }}
        >
          <ListItemIcon className={classNames(classes.icon, { [classes.iconActive]: isSettingsOpen })}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            className={classes.listItemText}
            primaryTypographyProps={{
              color: "textSecondary",
              variant: "body1"
            }}
          >
            <Translation defaultValue="Settings" i18nKey={"app.settings"} />
          </ListItemText>
        </ListItem>

        <Collapse in={isSettingsOpen}>
          {settingRoutes.map((route) => (
            <NavLink
              activeClassName={activeClassName}
              className={classes.link}
              to={`/operator${route.path}`}
              key={route.path}
              onClick={onDrawerClose}
            >
              <ListItem button className={classes.listItemNested}>
                <ListItemText
                  className={classes.listItemText}
                  primaryTypographyProps={{
                    color: "textSecondary",
                    variant: "body1"
                  }}
                >
                  <Translation defaultValue="" i18nKey={route.sidebarI18nLabel} />
                </ListItemText>
              </ListItem>
            </NavLink>
          ))}
        </Collapse>
      </List>
    </Drawer>
  );
}

Sidebar.propTypes = {
  classes: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }),
  isMobile: PropTypes.bool,
  isSettingsOpen: PropTypes.bool,
  isSidebarOpen: PropTypes.bool.isRequired,
  onDrawerClose: PropTypes.func.isRequired,
  routes: PropTypes.array,
  setIsSettingsOpen: PropTypes.func.isRequired
};

Sidebar.defaultProps = {
  setIsSidebarOpen() {}
};

export default compose(
  withRouter,
  withStyles(styles, { name: "RuiSidebar" }),
  withState("isSettingsOpen", "setIsSettingsOpen", false)
)(Sidebar);
