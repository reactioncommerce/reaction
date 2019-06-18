import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import withStyles from "@material-ui/core/styles/withStyles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";


const styles = (theme) => ({
  leftSidebarOpen: {
    ...theme.mixins.leadingPaddingWhenPrimaryDrawerIsOpen
  }
});

class OrderCardAppBar extends Component {
  static propTypes = {
    classes: PropTypes.object
  }

  render() {
    const { classes } = this.props;

    const uiState = {
      isLeftDrawerOpen: false
    };

    const toolbarClassName = classnames({
      [classes.leftSidebarOpen]: uiState.isLeftDrawerOpen
    });

    return (
      <AppBar color="default">
        <Toolbar className={toolbarClassName} />
      </AppBar>
    );
  }
}

export default withStyles(styles, { name: "MuiOrderCard" })(OrderCardAppBar);
