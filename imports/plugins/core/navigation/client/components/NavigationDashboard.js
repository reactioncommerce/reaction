import React, { Component } from "react";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";
import NavigationItemForm from "./NavigationItemForm";
import NavigationTreeContainer from "./NavigationTreeContainer";
import NavigationItemList from "./NavigationItemList";
import PrimaryAppBar from "/imports/client/ui/components/PrimaryAppBar";


const styles = (theme) => ({
  root: {
    display: "flex",
    height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    overflow: "hidden"
  },
  leftSidebarOpen: {
    ...theme.mixins.leadingPaddingWhenPrimaryDrawerIsOpen
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
    onDiscardNavigationTreeChanges: PropTypes.func,
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

  updateNavigationItem = (navigationItemDoc, sortableTreeNode) => {
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

    // Add visibility flags from the navigation tree node
    if (sortableTreeNode) {
      const { node: navigationTreeItem } = sortableTreeNode;
      navigationItem.isInNavigationTree = typeof navigationTreeItem === "object";
      navigationItem.isVisible = navigationTreeItem.isVisible;
      navigationItem.isPrivate = navigationTreeItem.isPrivate;
      navigationItem.isSecondary = navigationTreeItem.isSecondary;
    }

    this.setState({
      isModalOpen: true,
      navigationItem,
      sortableTreeNode,
      modalMode: "edit"
    });
  }

  render() {
    const {
      classes,
      createNavigationItem,
      deleteNavigationItem,
      navigationItems,
      onSetSortableNavigationTree,
      sortableNavigationTree,
      onDiscardNavigationTreeChanges,
      updateNavigationItem,
      updateNavigationTree
    } = this.props;

    const {
      isModalOpen,
      modalMode,
      navigationItem,
      sortableTreeNode
    } = this.state;

    return (
      <div className={classes.root}>
        <PrimaryAppBar title="Main Navigation">
          <Button color="primary" onClick={onDiscardNavigationTreeChanges}>Discard</Button>
          <Button color="primary" variant="contained" onClick={updateNavigationTree}>Save Changes</Button>
        </PrimaryAppBar>
        <NavigationItemList
          onClickAddNavigationItem={this.addNavigationItem}
          navigationItems={navigationItems}
          onClickUpdateNavigationItem={this.updateNavigationItem}
        />
        <NavigationTreeContainer
          sortableNavigationTree={sortableNavigationTree}
          onSetSortableNavigationTree={onSetSortableNavigationTree}
          onClickUpdateNavigationItem={this.updateNavigationItem}
        />
        <Dialog
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          fullWidth={true}
          maxWidth="sm"
          open={isModalOpen}
          onClose={this.handleCloseModal}
        >
          <DialogContent>
            <NavigationItemForm
              createNavigationItem={createNavigationItem}
              deleteNavigationItem={deleteNavigationItem}
              mode={modalMode}
              navigationItem={navigationItem}
              sortableTreeNode={sortableTreeNode}
              onCloseForm={this.handleCloseModal}
              updateNavigationItem={updateNavigationItem}
              onSetSortableNavigationTree={onSetSortableNavigationTree}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(withStyles(styles)(NavigationDashboard));
