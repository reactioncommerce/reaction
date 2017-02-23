import React, { PropTypes } from "react";
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
  hover(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

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
    connectDragPreview: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
  };

  let decoratedComponent = SortableItem;
  decoratedComponent = DragSource(itemType, cardSource, collectDropSource)(decoratedComponent);
  decoratedComponent = DropTarget(itemType, cardTarget, collectDropTarget)(decoratedComponent);

  return decoratedComponent;
}
