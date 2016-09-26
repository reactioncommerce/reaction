import React, { PropTypes } from "react";
import { findDOMNode } from "react-dom";
import { DragSource, DropTarget } from "react-dnd";

const cardSource = {
  beginDrag(props) {
    return {
      index: props.index
    };
  }
};

/**
 * Specifies the props to inject into your component.
 * @param {DragSourceConnector} connect An onject containing functions to assign roles to a component's DOM nodes
 * @param {DragSourceMonitor} monitor An object containing functions that return information about drag state
 * @return {Object} Props for drag source
 */
function collectDropSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

function collectDropTarget(connect) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

const cardTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get horizontal middle
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels from left
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // // Dragging to left
    // // Don't update position if we are dragging an item to the [left],
    // // but have not crossed the middle of the item we are dragging over
    // if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
    //   return;
    // }
    //
    // // Dragging to right
    // // Don't update position if we are dragging an item to the [right],
    // // but have not crossed the middle of the item we are dragging over
    // if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
    //   return;
    // }
    //
    //
    // // Dragging downwards
    // if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
    //   return;
    // }
    //
    // // Dragging upwards
    // if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
    //   return;
    // }
    //
    // Move up the list
    // if (dragIndex > hoverIndex && (hoverClientX > hoverMiddleX && hoverClientY < hoverMiddleY)) {
    //   return;
    // }
    //
    // // Move down the list
    // if (dragIndex < hoverIndex && (hoverClientX < hoverMiddleX && hoverClientY > hoverMiddleY)) {
    //   return;
    // }

    //
    //
    // console.log("should update");
    // return

    // Time to actually perform the action
    props.onMove(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

export default function ComposeSortableItem(itemType, SortableItemComponent) {
  const SortableItem = (props) => {
    return <SortableItemComponent {...props} />;
  };

  SortableItem.contextTypes = {
    dragDropManager: PropTypes.object.isRequired
  };

  SortableItem.propTypes = {
    // Injected by React DnD:
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
  };

  let decoratedComponent = SortableItem;
  decoratedComponent = DragSource(itemType, cardSource, collectDropSource)(decoratedComponent);
  decoratedComponent = DropTarget(itemType, cardTarget, collectDropTarget)(decoratedComponent);

  return decoratedComponent;
}
