import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import NavigationItemList from "./NavigationItemList";
import TagList from "./TagList";

const styles = () => ({
  root: {
    flexGrow: 1
  },
  tabRoot: {
    height: "60px",
    marginTop: "22px"
  }
});

class NavigationItemTabs extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    navigationItems: PropTypes.array,
    onClickAddNavigationItem: PropTypes.func,
    onClickUpdateNavigationItem: PropTypes.func,
    onSetDraggingNavigationItemId: PropTypes.func,
    updateNavigationItem: PropTypes.func
  }

  render() {
    const { classes } = this.props;

    const {
      navigationItems,
      onClickAddNavigationItem,
      onClickUpdateNavigationItem,
      onSetDraggingNavigationItemId,
      updateNavigationItem
    } = this.props;

    return (
      <div className={classes.root}>
        <NavigationItemList
          onClickAddNavigationItem={onClickAddNavigationItem}
          onClickUpdateNavigationItem={onClickUpdateNavigationItem}
          navigationItems={navigationItems}
          updateNavigationItem={updateNavigationItem}
          onSetDraggingNavigationItemId={onSetDraggingNavigationItemId}
        />
      </div>
    );
  }
}

export default withStyles(styles)(NavigationItemTabs);
