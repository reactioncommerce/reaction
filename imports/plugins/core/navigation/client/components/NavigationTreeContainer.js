import React, { Component } from "react";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import withStyles from "@material-ui/core/styles/withStyles";
import PencilIcon from "mdi-material-ui/Pencil";
import CloseIcon from "mdi-material-ui/Close";
import { SortableTreeWithoutDndContext as SortableTree, removeNodeAtPath } from "react-sortable-tree";
import "react-sortable-tree/style.css";
import ConfirmDialog from "@reactioncommerce/catalyst/ConfirmDialog";
import SortableTheme from "./SortableTheme";

const styles = (theme) => ({
  wrapper: {
    width: "100%",
    borderLeft: `1px solid ${theme.palette.divider}`,
    height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`
  }
});

class NavigationTreeContainer extends Component {
  static propTypes = {
    classes: PropTypes.object,
    navigationTreeRows: PropTypes.array,
    onClickUpdateNavigationItem: PropTypes.func,
    onDragHover: PropTypes.func,
    onSetOverNavigationItemId: PropTypes.func,
    onSetSortableNavigationTree: PropTypes.func,
    onToggleChildrenVisibility: PropTypes.func,
    overNavigationItemId: PropTypes.string,
    sortableNavigationTree: PropTypes.arrayOf(PropTypes.object)
  }

  static defaultProps = {
    onSetSortableNavigationTree() {}
  }

  getNodeKey = ({ treeIndex }) => treeIndex;

  generateNodeProps = ({ node, path }) => {
    const { onClickUpdateNavigationItem, onSetSortableNavigationTree, sortableNavigationTree } = this.props;

    return {
      buttons: [
        <IconButton
          onClick={() => {
            onClickUpdateNavigationItem(node.navigationItem, {
              getNodeKey: this.getNodeKey,
              node,
              path,
              treeData: sortableNavigationTree
            });
          }}
        >
          <PencilIcon />
        </IconButton>,
        <ConfirmDialog
          ButtonComponent={IconButton}
          openButtonContent={<CloseIcon />}
          title={"Remove this navigation item?"}
          onConfirm={() => {
            const newSortableNavigationTree = removeNodeAtPath({
              treeData: sortableNavigationTree,
              path,
              getNodeKey: this.getNodeKey
            });
            onSetSortableNavigationTree(newSortableNavigationTree);
          }}
        >
          {({ openDialog }) => (
            <IconButton onClick={openDialog}>
              <CloseIcon />
            </IconButton>
          )}
        </ConfirmDialog>
      ]
    };
  }

  render() {
    const { classes, onSetSortableNavigationTree, sortableNavigationTree } = this.props;
    return (
      <div className={classes.wrapper}>
        <SortableTree
          reactVirtualizedListProps={{
            style: {
              paddingTop: "50px",
              boxSizing: "border-box"
            },
            containerStyle: {
              position: "relative",
              overflow: "visible"
            }
          }}
          generateNodeProps={this.generateNodeProps}
          treeData={sortableNavigationTree || []}
          maxDepth={10}
          onChange={onSetSortableNavigationTree}
          theme={SortableTheme}
          dndType={"CARD"}
        />
      </div>
    );
  }
}

export default withStyles(styles, { name: "RuiNavigationTreeContainer" })(NavigationTreeContainer);
