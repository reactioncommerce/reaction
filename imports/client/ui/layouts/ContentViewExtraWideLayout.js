/**
 * Component provides a full width and height, non-scrollable container
 * for dashboard layouts that have large views like tables.
 */
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme) => ({
  root: {
    width: "100vw",
    paddingTop: theme.mixins.toolbar.minHeight + (theme.spacing.unit * 3),
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    background: "",
    flexGrow: 1,
    transition: "padding 225ms cubic-bezier(0, 0, 0.2, 1) 0ms"
  },
  leftSidebarOpen: {
    paddingLeft: 280 + (theme.spacing.unit * 3)
  }
});

const ContentViewExtraWideLayout = ({ children, classes, isMobile, isSidebarOpen }) => (
  <div
    className={
      classNames(classes.root, {
        [classes.leftSidebarOpen]: isSidebarOpen && isMobile === false
      })
    }
  >
    {children}
  </div>
);

ContentViewExtraWideLayout.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  isMobile: PropTypes.bool,
  isSidebarOpen: PropTypes.bool
};

export default withStyles(styles, { name: "RuiContentViewExtraWideLayout" })(ContentViewExtraWideLayout);
