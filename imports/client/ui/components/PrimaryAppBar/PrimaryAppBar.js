import React, { Children } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import AppBar from "@material-ui/core/AppBar";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import MenuIcon from "mdi-material-ui/Menu";
import { UIContext } from "../../context/UIContext";

const styles = (theme) => ({
  action: {
    marginLeft: theme.spacing.unit
  },
  primarySidebarOpen: {
    paddingLeft: 280 + (theme.spacing.unit * 2)
  },
  title: {
    flex: 1
  }
});

/**
 * An AppBar for the main content area that provides a place for a title,
 * actions to the right, and a menu button for opening and closing the sidebar drawer menu
 * @param {Object} props Component props
 * @returns {React.Component} A react component
 */
function PrimaryAppBar({ children, classes, title }) {
  return (
    <UIContext.Consumer>
      {({ isMobile, isPrimarySidebarOpen, onTogglePrimarySidebar }) => {
        const toolbarClassName = classNames({
          // Add padding to the right when the primary sidebar is open,
          // only if we're on desktop. On Mobile the sidebar floats over
          // the content like a modal that's docked to either the left
          // or right side of the screen.
          [classes.primarySidebarOpen]: isPrimarySidebarOpen && !isMobile
        });

        return (
          <AppBar>
            <Toolbar className={toolbarClassName}>
              <Hidden mdUp>
                <IconButton onClick={onTogglePrimarySidebar}>
                  <MenuIcon />
                </IconButton>
              </Hidden>
              <Typography
                className={classes.title}
                component="h1"
                variant="h6"
              >
                {title}
              </Typography>
              {Children.map(children, (child) => (
                <div className={classes.action}>
                  {child}
                </div>
              ))}
            </Toolbar>
          </AppBar>
        );
      }}
    </UIContext.Consumer>
  );
}

PrimaryAppBar.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  onToggleDrawerOpen: PropTypes.func,
  title: PropTypes.string
};

export default withStyles(styles, { name: "RuiPrimaryAppBar" })(PrimaryAppBar);
