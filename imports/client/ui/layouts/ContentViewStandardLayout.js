import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme) => ({
  root: {
    width: "100vw",
    flexGrow: 1,
    transition: "padding 225ms cubic-bezier(0, 0, 0.2, 1) 0ms"
  },
  content: {
    maxWidth: 1140,
    paddingTop: theme.mixins.toolbar.minHeight + (theme.spacing(2)),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    margin: "0 auto"
  },
  leadingDrawerOpen: {
    paddingLeft: theme.dimensions.drawerWidth
  },
  trailingDrawerOpen: {
    paddingRight: theme.dimensions.detailDrawerWidth
  }
});

const ContentViewStandardLayout = ({ children, classes, isLeadingDrawerOpen, isTrailingDrawerOpen }) => (
  <div
    className={
      classNames(classes.root, {
        [classes.leadingDrawerOpen]: isLeadingDrawerOpen,
        [classes.trailingDrawerOpen]: isTrailingDrawerOpen
      })
    }
  >
    <div className={classes.content}>
      {children}
    </div>
  </div>
);

ContentViewStandardLayout.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  isLeadingDrawerOpen: PropTypes.bool,
  isMobile: PropTypes.bool,
  isTrailingDrawerOpen: PropTypes.bool
};

export default withStyles(styles, { name: "RuiContentViewStandardLayout" })(ContentViewStandardLayout);
