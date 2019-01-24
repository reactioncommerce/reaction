import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import NavigationItemsList from "../../NavigationItemsList/v1";
import TagsList from "../../TagsList/v1";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  },
  tabRoot: {
    textTransform: "initial",
    fontSize: "14px",
    height: "60px",
    marginTop: "22px",
    fontFamily: "Source Sans Pro, Helvetica Neue, Helvetica, sans-serif"
  }
});

class NavigationItemTabs extends React.Component {
  static propTypes = {
    navigationItems: PropTypes.array,
    onClickAddNavigationItem: PropTypes.func,
    onClickUpdateNavigationItem: PropTypes.func,
    onSetDraggingNavigationItemId: PropTypes.func,
    tags: PropTypes.array,
    updateNavigationItem: PropTypes.func
  }

  state = {
    value: 0
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  renderNavigationItemsTab() {
    const { value } = this.state;
    const {
      navigationItems,
      onClickAddNavigationItem,
      onClickUpdateNavigationItem,
      onSetDraggingNavigationItemId,
      tags,
      updateNavigationItem
    } = this.props;
    if (value === 0) {
      return <TagsList tags={tags}/>;
    }
    return (
      <NavigationItemsList
        onClickAddNavigationItem={onClickAddNavigationItem}
        onClickUpdateNavigationItem={onClickUpdateNavigationItem}
        navigationItems={navigationItems}
        updateNavigationItem={updateNavigationItem}
        onSetDraggingNavigationItemId={onSetDraggingNavigationItemId}
      />
    );
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        <Paper square>
          <Tabs
            value={value}
            indicatorColor="primary"
            textColor="primary"
            onChange={this.handleChange}
            classes={{ root: classes.tabsRoot }}
          >
            <Tab label="Tags" classes={{ root: classes.tabRoot }}/>
            <Tab label="Items" classes={{ root: classes.tabRoot }} />
          </Tabs>
        </Paper>
        {this.renderNavigationItemsTab()}
      </div>
    );
  }
}

export default withStyles(styles)(NavigationItemTabs);
