import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import NavigationItemCard from "./NavigationItemCard";


const styles = (theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    width: "100%",
    maxWidth: 380
  },
  header: {
    padding: theme.spacing(2),
    textAlign: "right",
    flex: 0
  },
  list: {
    flex: 1,
    overflowY: "auto",
    height: "100%"
  },
  listContent: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
});

class NavigationItemList extends Component {
  static propTypes = {
    classes: PropTypes.object,
    navigationItems: PropTypes.array,
    onClickAddNavigationItem: PropTypes.func,
    onClickUpdateNavigationItem: PropTypes.func,
    onSetDraggingNavigationItemId: PropTypes.func
  }

  renderNavigationItems() {
    const { navigationItems, onClickUpdateNavigationItem, onSetDraggingNavigationItemId } = this.props;
    if (navigationItems) {
      return navigationItems.map((navigationItem) => {
        const row = { node: { navigationItem } };
        return (
          <NavigationItemCard
            row={row}
            key={navigationItem._id}
            onClickUpdateNavigationItem={onClickUpdateNavigationItem}
            onSetDraggingNavigationItemId={onSetDraggingNavigationItemId}
          />
        );
      });
    }
    return null;
  }

  render() {
    const { classes, onClickAddNavigationItem } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <Button color="primary" variant="outlined" onClick={onClickAddNavigationItem}>Add navigation item</Button>
        </div>
        <div className={classes.list}>
          <div className={classes.listContent}>
            {this.renderNavigationItems()}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { name: "RuiNavigationItemList" })(NavigationItemList);
