// Based on theme: https://github.com/frontend-collective/react-sortable-tree-theme-file-explorer
import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "mdi-material-ui/ChevronRight";
import DragIcon from "mdi-material-ui/Drag";

const styles = (theme) => ({
  cardContent: {
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    height: "100%"
  },
  dragIcon: {
    padding: 6
  },
  // Expand styles. This empty object has to be here for "&$expanded" to work below.
  expanded: {},
  expandIcon: {
    "padding": 6,
    "transform": "rotate(0deg)",
    "transition": theme.transitions.create("transform", { duration: theme.transitions.duration.shortest }),
    "&:hover": {
      backgroundColor: "transparent"
    },
    "&$expanded": {
      transform: "rotate(90deg)"
    }
  }
});

/**
 * Check if node is a descendant
 * @param {Object} older Parent
 * @param {Object} younger Child
 * @returns {Boolean} Boolean value
 */
function isDescendant(older, younger) {
  return (
    !!older.children &&
    typeof older.children !== "function" &&
    older.children.some((child) => child === younger || isDescendant(child, younger))
  );
}

class SortableNodeContentRenderer extends Component {
  static propTypes = {
    buttons: PropTypes.arrayOf(PropTypes.node),
    canDrag: PropTypes.bool,
    canDrop: PropTypes.bool,
    className: PropTypes.string,
    classes: PropTypes.object,
    connectDragPreview: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    didDrop: PropTypes.bool.isRequired, // eslint-disable-line react/boolean-prop-naming
    draggedNode: PropTypes.shape({}),
    icons: PropTypes.arrayOf(PropTypes.node),
    isDragging: PropTypes.bool.isRequired,
    isOver: PropTypes.bool.isRequired,
    isSearchFocus: PropTypes.bool,
    isSearchMatch: PropTypes.bool,
    listIndex: PropTypes.number.isRequired,
    lowerSiblingCounts: PropTypes.arrayOf(PropTypes.number).isRequired,
    node: PropTypes.shape({}).isRequired,
    parentNode: PropTypes.shape({}), // Needed for dndManager
    path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
    rowDirection: PropTypes.string.isRequired,
    scaffoldBlockPxWidth: PropTypes.number.isRequired,
    style: PropTypes.shape({}),
    swapDepth: PropTypes.number,
    swapFrom: PropTypes.number,
    swapLength: PropTypes.number,
    title: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    toggleChildrenVisibility: PropTypes.func,
    treeId: PropTypes.string.isRequired,
    treeIndex: PropTypes.number.isRequired
  }

  static defaultProps = {
    buttons: [],
    canDrag: false,
    canDrop: false,
    className: "",
    draggedNode: null,
    icons: [],
    isSearchFocus: false,
    isSearchMatch: false,
    parentNode: null,
    style: {},
    swapDepth: null,
    swapFrom: null,
    swapLength: null,
    title: null,
    toggleChildrenVisibility: null
  }

  render() {
    const {
      classes,

      // ReactSortableTreeProps
      scaffoldBlockPxWidth,
      toggleChildrenVisibility,
      connectDragPreview,
      connectDragSource,
      isDragging,
      canDrop,
      canDrag,
      node,
      title,
      draggedNode,
      path,
      treeIndex,
      isSearchMatch,
      isSearchFocus,
      icons,
      buttons,
      className,
      style,
      didDrop,
      lowerSiblingCounts,
      listIndex,
      swapFrom,
      swapLength,
      swapDepth,
      treeId, // Not needed, but preserved for other renderers
      isOver, // Not needed, but preserved for other renderers
      parentNode, // Needed for dndManager
      rowDirection,
      ...otherProps
    } = this.props;
    const nodeTitle = title || node.title;

    const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
    const isLandingPadActive = !didDrop && isDragging;

    // Construct the scaffold representing the structure of the tree
    const scaffold = [];
    lowerSiblingCounts.forEach((lowerSiblingCount, i) => {
      scaffold.push((
        <div
          key={`pre_${1 + i}`}
          // style={{ width: scaffoldBlockPxWidth }}
          className={styles.lineBlock}
        />
      ));

      if (treeIndex !== listIndex && i === swapDepth) {
        // This row has been shifted, and is at the depth of
        // the line pointing to the new destination
        let highlightLineClass = "";

        if (listIndex === swapFrom + swapLength - 1) {
          // This block is on the bottom (target) line
          // This block points at the target block (where the row will go when released)
          highlightLineClass = styles.highlightBottomLeftCorner;
        } else if (treeIndex === swapFrom) {
          // This block is on the top (source) line
          highlightLineClass = styles.highlightTopLeftCorner;
        } else {
          // This block is between the bottom and top
          highlightLineClass = styles.highlightLineVertical;
        }

        scaffold.push((
          <div
            key={`highlight_${1 + i}`}
            style={{
              left: scaffoldBlockPxWidth * i
            }}
            className={`${styles.absoluteLineBlock} ${highlightLineClass}`}
          />
        ));
      }
    });

    const nodeContent = (
      <div
        style={{
          marginTop: -2,
          height: "100%",
          marginLeft: (lowerSiblingCounts.length - 1) * scaffoldBlockPxWidth
        }}
        {...otherProps}
      >
        <Card className={classes.cardContent} elevation={3}>

          <IconButton
            aria-label="Drag"
            className={classNames(classes.dragIcon)}
            disableRipple
            disableTouchRipple
          >
            <DragIcon />
          </IconButton>

          {toggleChildrenVisibility && node.children && node.children.length > 0 && (
            <IconButton
              aria-label={node.expanded ? "Collapse" : "Expand"}
              className={classNames(classes.expandIcon, {
                [classes.expanded]: node.expanded
              })}
              onClick={() => toggleChildrenVisibility({ node, path, treeIndex })}
            >
              <ChevronRightIcon />
            </IconButton>
          )}

          <div
            className={
              styles.rowWrapper +
              (!canDrag ? ` ${styles.rowWrapperDragDisabled}` : "")
            }
          >

            {/* Set the row preview to be used during drag and drop */}
            {connectDragPreview((
              <div style={{ display: "flex" }}>
                {scaffold}
                <div
                  className={
                    styles.row +
                    (isLandingPadActive ? ` ${styles.rowLandingPad}` : "") +
                    (isLandingPadActive && !canDrop
                      ? ` ${styles.rowCancelPad}`
                      : "") +
                    (isSearchMatch ? ` ${styles.rowSearchMatch}` : "") +
                    (isSearchFocus ? ` ${styles.rowSearchFocus}` : "") +
                    (className ? ` ${className}` : "")
                  }
                  style={{
                    opacity: isDraggedDescendant ? 0.5 : 1,
                    ...style
                  }}
                >
                  <div
                    className={
                      styles.rowContents +
                      (!canDrag ? ` ${styles.rowContentsDragDisabled}` : "")
                    }
                  >
                    <div className={styles.rowToolbar}>
                      {icons.map((icon, index) => (
                        <div
                          key={index} // eslint-disable-line react/no-array-index-key
                          className={styles.toolbarButton}
                        >
                          {icon}
                        </div>
                      ))}
                    </div>
                    <div className={styles.rowLabel}>
                      <span className={styles.rowTitle}>
                        {typeof nodeTitle === "function"
                          ? nodeTitle({
                            node,
                            path,
                            treeIndex
                          })
                          : nodeTitle}
                      </span>
                    </div>

                    <div className={styles.rowToolbar}>
                      {buttons.map((btn, index) => (
                        <div
                          key={index} // eslint-disable-line react/no-array-index-key
                          className={styles.toolbarButton}
                        >
                          {btn}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    );

    return canDrag
      ? connectDragSource(nodeContent, { dropEffect: "copy" })
      : nodeContent;
  }
}

export default withStyles(styles, { name: "RuiSortableNodeContentRenderer" })(SortableNodeContentRenderer);
