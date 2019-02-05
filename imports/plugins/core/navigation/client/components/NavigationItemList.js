import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import NavigationItemCard from "./NavigationItemCard";


const styles = (theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2
  },
  header: {
    marginBottom: theme.spacing.unit * 2,
    textAlign: "right"
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
        {this.renderNavigationItems()}
      </div>
    );
  }
}

export default withStyles(styles, { name: "RuiNavigationItemList" })(NavigationItemList);
