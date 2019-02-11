import React, { Component, Children, cloneElement } from "react";
import PropTypes from "prop-types";

const styles = {};

class FileThemeTreeNodeRenderer extends Component {
  static propTypes = {
    canDrop: PropTypes.bool,
    children: PropTypes.node.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    draggedNode: PropTypes.shape({}),
    getPrevRow: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    listIndex: PropTypes.number.isRequired,
    lowerSiblingCounts: PropTypes.arrayOf(PropTypes.number).isRequired,
    node: PropTypes.shape({}).isRequired,
    path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
    rowDirection: PropTypes.string.isRequired,
    scaffoldBlockPxWidth: PropTypes.number.isRequired,
    swapDepth: PropTypes.number,
    swapFrom: PropTypes.number,
    swapLength: PropTypes.number,
    treeId: PropTypes.string.isRequired,
    treeIndex: PropTypes.number.isRequired
  }

  static defaultProps = {
    swapFrom: null,
    swapDepth: null,
    swapLength: null,
    canDrop: false,
    draggedNode: null
  }

  render() {
    const {
      children,
      listIndex,
      swapFrom,
      swapLength,
      swapDepth,
      scaffoldBlockPxWidth,
      lowerSiblingCounts,
      connectDropTarget,
      isOver,
      draggedNode,
      canDrop,
      treeIndex,
      treeId, // Delete from otherProps
      getPrevRow, // Delete from otherProps
      node, // Delete from otherProps
      path, // Delete from otherProps
      rowDirection,
      ...otherProps
    } = this.props;

    return connectDropTarget((
      <div {...otherProps} className={styles.node}>
        {Children.map(children, (child) => (
          cloneElement(child, {
            isOver,
            canDrop,
            draggedNode,
            lowerSiblingCounts,
            listIndex,
            swapFrom,
            swapLength,
            swapDepth
          })
        ))}
      </div>
    ));
  }
}

export default FileThemeTreeNodeRenderer;
