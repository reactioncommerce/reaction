import React, { Component } from "react";
import PropTypes from "prop-types";
import { findDOMNode } from "react-dom";
import { compose } from "recompose";
import Grid from "@material-ui/core/Grid";
import { DropTarget } from "react-dnd";
import NavigationItemCard from "./NavigationItemCard";

const navigationTreeRowTarget = {
  drop(props) {
    console.log(props);
  },
  hover(props, monitor, component) {
    // find the middle of things
    const { onDragHover, row: { treeIndex: targetTreeIndex } } = props;
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const rowLength = hoverBoundingRect.right - hoverBoundingRect.left;
    const clientOffset = monitor.getClientOffset();
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    const treeIndex = hoverClientY < hoverMiddleY ? targetTreeIndex : targetTreeIndex + 1;
    let depth = 2;
    if (hoverClientX < 0.08 * rowLength) {
      depth = 0;
    } else if (hoverClientX < 0.17 * rowLength) {
      depth = 1;
    }
    const draggedNode = monitor.getItem().row.node;
    onDragHover({ depth, draggedNode, treeIndex });
  }
};

/**
 * @name targetCollect
 * @summary a collecting function to connect nodes to the DnD backend
 * @param {Object} connect - an instance of DropTargetConnector
 * @param {Object} monitor - an instance of DropTargetMonitor
 * @returns {Object} props to be injected into the component
 */
function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

class NavigationTreeNode extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func,
    onClickUpdateNavigationItem: PropTypes.func,
    onDragHover: PropTypes.func,
    onSetOverNavigationItemId: PropTypes.func,
    onToggleChildrenVisibility: PropTypes.func,
    row: PropTypes.object
  }

  renderNavigationItemCard(row) {
    const { onClickUpdateNavigationItem, onSetOverNavigationItemId, onToggleChildrenVisibility } = this.props;
    return (
      <NavigationItemCard
        isInTree
        onClickUpdateNavigationItem={onClickUpdateNavigationItem}
        onSetOverNavigationItemId={onSetOverNavigationItemId}
        onToggleChildrenVisibility={onToggleChildrenVisibility}
        row={row}
      />
    );
  }

  render() {
    const { connectDropTarget, row } = this.props;
    const { path } = row;
    const offset = path.length - 1;
    const offsets = path.map((item, index) => {
      if (index === 0) {
        return null;
      }
      return (<Grid item md={1} key={index}/>);
    });

    const toRender = (
      <Grid container key={path[offset]}>
        {offsets}
        <Grid item md={12 - offset}>
          {this.renderNavigationItemCard(row)}
        </Grid>
      </Grid>
    );

    return connectDropTarget(<div>{toRender}</div>);
  }
}

export default compose(DropTarget("CARD", navigationTreeRowTarget, targetCollect))(NavigationTreeNode);
