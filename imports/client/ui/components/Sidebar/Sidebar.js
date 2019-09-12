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
  closeButton: {
    "color": theme.palette.colors.white,
    "backgroundColor": theme.palette.colors.darkBlue500,
    "&:hover": {
      "backgroundColor": theme.palette.colors.darkBlue600,
      // Reset on touch devices, it doesn't add specificity
      "@media (hover: none)": {
        backgroundColor: theme.palette.colors.darkBlue500
      }
    }
  },
  icon: {
    minWidth: 32,
    display: "flex",
    justifyContent: "center",
    marginRight: theme.spacing(2),
    color: theme.palette.colors.coolGrey300
  },
  iconActive: {
    color: theme.palette.text.active
  },
  shopLogo: {
    flex: 1,
    marginRight: theme.spacing(2)
  },
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  listItem: {
    "paddingLeft": theme.spacing(2),
    "paddingRight": theme.spacing(2),
    "&:hover": {
      backgroundColor: theme.palette.colors.darkBlue600,
      transition: `background-color ${theme.transitions.duration.shortest} ${theme.transitions.easing.easeInOut}`
    }
  },
  listItemText: {
    paddingLeft: 0,
    fontSize: theme.typography.fontSize,
    lineHeight: 1.5,
    letterSpacing: 0.5,
    color: theme.palette.colors.black15
  },
  listItemNested: {
    "paddingTop": 0,
    "paddingBottom": 0,
    "paddingLeft": theme.spacing(8),
    "&:hover": {
      backgroundColor: theme.palette.colors.darkBlue600,
      transition: `background-color ${theme.transitions.duration.shortest} ${theme.transitions.easing.easeInOut}`
    }
  },
  link: {
    [`&.${activeClassName} span`]: {
      color: theme.palette.text.secondaryActive,
      fontWeight: theme.typography.fontWeightSemiBold
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
            <Fab classes={{ root: classes.closeButton }} onClick={onDrawerClose} size="small">
              <CloseIcon />
            </Fab>
          </Hidden>

        </Toolbar>
      </AppBar>
      <List disablePadding>
        {primaryRoutes.map((route) => (
          <NavLink
            activeClassName={!isSettingsOpen ? activeClassName : null}
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
                disableTypography
                className={classes.listItemText}
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
            disableTypography
            className={classes.listItemText}
          >
            <Translation i18nKey={"app.settings"} />
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
                  disableTypography
                  className={classes.listItemText}
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
