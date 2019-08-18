import React, { Children } from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import Drawer from "@material-ui/core/Drawer";
import withStyles from "@material-ui/core/styles/withStyles";
import CloseIcon from "mdi-material-ui/Close";
import { Typography } from "@material-ui/core";
import { UIContext } from "../../context/UIContext";

const styles = (theme) => ({
  action: {
    marginLeft: theme.spacing()
  },
  content: {
    paddingTop: theme.spacing(),
    marginLeft: "-1px",
    marginRight: "-1px"
  },
  title: {
    flex: 1,
    paddingLeft: theme.spacing()
  }
});

/**
 * Detail drawer used for displaying supplementary info and actions for a view.
 * @param {Object} props Component props
 * @returns {React.Component} Sidebar component
 */
function DetailDrawer(props) {
  const {
    anchor,
    children,
    classes,
    title
  } = props;

  return (
    <UIContext.Consumer>
      {({ isMobile, onCloseDetailDrawer, isDetailDrawerOpen }) => (
        <Drawer
          elevation={2}
          variant={isMobile ? "temporary" : "persistent"}
          anchor={anchor}
          open={isDetailDrawerOpen}
          onClose={onCloseDetailDrawer}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
        >
          <AppBar
            color="default"
            elevation={0}
            position="sticky"
          >
            <Toolbar>
              <Typography className={classes.title} variant="h3">{title}</Typography>
              <IconButton onClick={onCloseDetailDrawer} size="small">
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          {Children.map(children, (child) => (
            <div className={classes.content}>{child}</div>
          ))}
        </Drawer>
      )}
    </UIContext.Consumer>
  );
}

DetailDrawer.propTypes = {
  anchor: PropTypes.oneOf(["left", "right", "top", "bottom"]),
  children: PropTypes.node,
  classes: PropTypes.object,
  title: PropTypes.string
};

DetailDrawer.defaultProps = {
  anchor: "right"
};

export default withStyles(styles, { name: "RuiDetailDrawer" })(DetailDrawer);
