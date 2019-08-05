/**
 * Component provies a fill width and height, non-scrollable container
 * for dashboard layouts that want to defin their on scroll zones.
 */
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    paddingTop: theme.mixins.toolbar.minHeight,
    background: "",
    flexGrow: 1,
    transition: "padding 225ms cubic-bezier(0, 0, 0.2, 1) 0ms",
    overflow: "hidden"
  },
  leadingDrawerOpen: {
    paddingLeft: theme.dimensions.drawerWidth
  },
  trailingDrawerOpen: {
    paddingRight: theme.dimensions.detailDrawerWidth
  }
});

const ContentViewFullLayout = ({ children, classes, isLeadingDrawerOpen, isTrailingDrawerOpen }) => (
  <div
    className={
      classNames(classes.root, {
        [classes.leadingDrawerOpen]: isLeadingDrawerOpen,
        [classes.trailingDrawerOpen]: isTrailingDrawerOpen
      })
    }
  >
    {children}
  </div>
);

ContentViewFullLayout.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  isLeadingDrawerOpen: PropTypes.bool,
  isMobile: PropTypes.bool,
  isTrailingDrawerOpen: PropTypes.bool
};

export default withStyles(styles, { name: "RuiContentViewFullLayout" })(ContentViewFullLayout);
