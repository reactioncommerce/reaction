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
import NavigationItemForm from "../../NavigationItemForm";
import NavigationTreeContainer from "../../NavigationTreeContainer/v1";
import NavigationItemTabs from "../../NavigationItemTabs/v1";

const styles = (theme) => ({
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
    navigationItems: PropTypes.array,
    navigationTreeRows: PropTypes.array,
    onDragHover: PropTypes.func,
    onToggleChildrenVisibility: PropTypes.func,
    tags: PropTypes.array,
    uiState: PropTypes.shape({
      isLeftDrawerOpen: PropTypes.bool
    }),
    updateNavigationItem: PropTypes.func
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

  addNavigationItem = () => this.setState({ isModalOpen: true, modalMode: "create", navigationItem: null });

  handleCloseModal = () => this.setState({ isModalOpen: false });

  handleSetDraggingNavigationItemId = (draggingNavigationItemId) => this.setState({ draggingNavigationItemId });

  handleSetOverNavigationItemId = (overNavigationItemId) => this.setState({ overNavigationItemId });

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
      navigationItems,
      navigationTreeRows,
      onDragHover,
      onToggleChildrenVisibility,
      tags,
      uiState,
      updateNavigationItem
    } = this.props;

    const {
      isModalOpen,
      modalMode,
      navigationItem,
      overNavigationItemId
    } = this.state;

    const toolbarClassName = classnames({
      [classes.leftSidebarOpen]: uiState.isLeftDrawerOpen
    });

    return (
      <div>

        <AppBar color="default">
          <Toolbar className={toolbarClassName}>
            <Typography className={classes.title} variant="h6">Main Navigation</Typography>
            <Button className={classes.toolbarButton} color="primary" onClick={this.handlePublishChanges}>Discard</Button>
            <Button className={classes.toolbarButton} color="primary" variant="outlined" onClick={this.handleSaveDraftChanges}>Save Changes</Button>
            <Button className={classes.toolbarButton} color="primary" variant="contained" onClick={this.handlePublishChanges}>Publish</Button>
          </Toolbar>
        </AppBar>

        <Grid container>
          <Grid item xs={3}>
            <NavigationItemTabs
              onClickAddNavigationItem={this.addNavigationItem}
              navigationItems={navigationItems}
              tags={tags}
              onClickUpdateNavigationItem={this.updateNavigationItem}
              onSetDraggingNavigationItemId={this.handleSetDraggingNavigationItemId}
            />
          </Grid>
          <Grid item xs={9}>
            <NavigationTreeContainer
              navigationTreeRows={navigationTreeRows}
              overNavigationItemId={overNavigationItemId}
              onClickUpdateNavigationItem={this.updateNavigationItem}
              onDragHover={onDragHover}
              onSetDraggingNavigationItemId={this.handleSetDraggingNavigationItemId}
              onSetOverNavigationItemId={this.handleSetOverNavigationItemId}
              onToggleChildrenVisibility={onToggleChildrenVisibility}
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
