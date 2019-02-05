import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import AppBar from "@material-ui/core/AppBar";
import Grid from "@material-ui/core/Grid";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";
import NavigationItemForm from "./NavigationItemForm";
import NavigationTreeContainer from "./NavigationTreeContainer";
import NavigationItemList from "./NavigationItemList";

const styles = (theme) => ({
  root: {
    height: "100vh",
    overflow: "hidden"
  },
  toolbarButton: {
    marginLeft: theme.spacing.unit
  },
  leftSidebarOpen: {
    paddingLeft: 280 + (theme.spacing.unit * 2)
  },
  paper: {
    position: "absolute",
    width: theme.spacing.unit * 80,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  },
  title: {
    flex: 1
  }
});

class NavigationDashboard extends Component {
  static propTypes = {
    classes: PropTypes.object,
    createNavigationItem: PropTypes.func,
    deleteNavigationItem: PropTypes.func,
    navigationItems: PropTypes.array,
    onSetSortableNavigationTree: PropTypes.func,
    sortableNavigationTree: PropTypes.arrayOf(PropTypes.object),
    uiState: PropTypes.shape({
      isLeftDrawerOpen: PropTypes.bool
    }),
    updateNavigationItem: PropTypes.func,
    updateNavigationTree: PropTypes.func
  }

  state = {
    draggingNavigationItemId: "",
    navigationItems: [],
    isModalOpen: false,
    modalMode: "create",
    navigationItem: null,
    overNavigationItemId: "",
    tags: []
  }

  addNavigationItem = () => {
    this.setState({ isModalOpen: true, modalMode: "create", navigationItem: null });
  }

  handleCloseModal = () => {
    this.setState({ isModalOpen: false });
  }

  updateNavigationItem = (navigationItemDoc) => {
    const { _id, draftData } = navigationItemDoc;
    const { content, url, isUrlRelative, shouldOpenInNewWindow, classNames } = draftData;
    const { value } = content.find((ct) => ct.language === "en");
    const navigationItem = {
      _id,
      name: value,
      url,
      isUrlRelative,
      shouldOpenInNewWindow,
      classNames
    };
    this.setState({ isModalOpen: true, navigationItem, modalMode: "edit" });
  }

  render() {
    const {
      classes,
      createNavigationItem,
      deleteNavigationItem,
      navigationItems,
      onSetSortableNavigationTree,
      sortableNavigationTree,
      uiState,
      updateNavigationItem,
      updateNavigationTree
    } = this.props;

    const {
      isModalOpen,
      modalMode,
      navigationItem
    } = this.state;

    const toolbarClassName = classnames({
      [classes.leftSidebarOpen]: uiState.isLeftDrawerOpen
    });

    return (
      <div className={classes.root}>
        <AppBar color="default">
          <Toolbar className={toolbarClassName}>
            <Typography className={classes.title} variant="h6">Main Navigation</Typography>
            <Button className={classes.toolbarButton} color="primary" onClick={this.handlePublishChanges}>Discard</Button>
            <Button className={classes.toolbarButton} color="primary" variant="contained" onClick={updateNavigationTree}>Save Changes</Button>
          </Toolbar>
        </AppBar>

        <Grid container>
          <Grid item xs={3}>
            <NavigationItemList
              onClickAddNavigationItem={this.addNavigationItem}
              navigationItems={navigationItems}
              onClickUpdateNavigationItem={this.updateNavigationItem}
            />
          </Grid>
          <Grid item xs={9}>
            <NavigationTreeContainer
              sortableNavigationTree={sortableNavigationTree}
              onSetSortableNavigationTree={onSetSortableNavigationTree}
              onClickUpdateNavigationItem={this.updateNavigationItem}
            />
          </Grid>
        </Grid>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isModalOpen}
          onClose={this.handleCloseModal}
        >
          <div className={classes.paper}>
            <NavigationItemForm
              createNavigationItem={createNavigationItem}
              deleteNavigationItem={deleteNavigationItem}
              mode={modalMode}
              navigationItem={navigationItem}
              onCloseForm={this.handleCloseModal}
              updateNavigationItem={updateNavigationItem}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(withStyles(styles)(NavigationDashboard));
