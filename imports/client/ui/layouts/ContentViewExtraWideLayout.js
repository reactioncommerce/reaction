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
    paddingTop: theme.mixins.toolbar.minHeight + (theme.spacing(3)),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    background: "",
    flexGrow: 1,
    transition: "padding 225ms cubic-bezier(0, 0, 0.2, 1) 0ms"
  },
  leadingDrawerOpen: {
    ...theme.mixins.leadingPaddingWhenPrimaryDrawerIsOpen
  },
  trailingDrawerOpen: {
    ...theme.mixins.leadingPaddingWhenPrimaryDrawerIsOpen
  }
});

const ContentViewExtraWideLayout = ({ children, classes, isLeadingDrawerOpen, isTrailingDrawerOpen }) => (
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

ContentViewExtraWideLayout.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  isLeadingDrawerOpen: PropTypes.bool,
  isMobile: PropTypes.bool,
  isTrailingDrawerOpen: PropTypes.bool
};

export default withStyles(styles, { name: "RuiContentViewExtraWideLayout" })(ContentViewExtraWideLayout);
