// Based on theme: https://github.com/frontend-collective/react-sortable-tree-theme-file-explorer
import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import ChevronRightIcon from "mdi-material-ui/ChevronRight";
import DragIcon from "mdi-material-ui/Drag";
import FileOutlineIcon from "mdi-material-ui/FileOutline";

const styles = (theme) => ({
  cardContent: {
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    height: "100%"
  },
  dragIcon: {
    "padding": 6,
    "color": theme.palette.colors.black30,
    "&:hover": {
      backgroundColor: "transparent"
    }
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
  },
  row: {
    display: "flex",
    flex: 1,
    alignItems: "center"
  },
  rowDragDisabled: {
    opacity: 0.8
  },
  rowContent: {
    flex: 1
  },
  rowToolbar: {
    display: "flex"
  },
  subtitle: {
    display: "flex",
    alignItems: "center"
  },
  subtitleIcon: {
    marginRight: 4
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
    subtitle: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
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
      subtitle,
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
    const nodeSubtitle = subtitle || node.subtitle;

    const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
    const isLandingPadActive = !didDrop && isDragging;

    // Construct the scaffold representing the structure of the tree
    const scaffold = [];
    lowerSiblingCounts.forEach((lowerSiblingCount, index) => {
      scaffold.push((
        <div
          key={`pre_${1 + index}`}
          // style={{ width: scaffoldBlockPxWidth }}
          className={styles.lineBlock}
        />
      ));

      if (treeIndex !== listIndex && index === swapDepth) {
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
            key={`highlight_${1 + index}`}
            style={{
              left: scaffoldBlockPxWidth * index
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
          marginLeft: (lowerSiblingCounts.length) * scaffoldBlockPxWidth,
          marginRight: scaffoldBlockPxWidth
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
          {/* Set the row preview to be used during drag and drop */}
          {connectDragPreview((
            <div style={{ display: "flex", flex: 1 }}>
              {scaffold}
              <div
                className={
                  classNames(classes.row, {
                    [classes.rowDragDisabled]: !canDrag,
                    [classes.rowLandingPad]: isLandingPadActive,
                    [classes.rowCancelPad]: isLandingPadActive && !canDrop,
                    [classes.rowSearchMatch]: isSearchMatch,
                    [classes.rowSearchFocus]: isSearchFocus
                  }, className)
                }
                style={{
                  opacity: isDraggedDescendant ? 0.5 : 1,
                  ...style
                }}
              >
                <div className={classes.rowContent}>
                  <Typography className={classes.title} variant="subtitle1">
                    {typeof nodeTitle === "function" ? nodeTitle({ node, path, treeIndex }) : nodeTitle}
                  </Typography>
                  <Typography className={classes.subtitle} variant="caption">
                    <FileOutlineIcon className={classes.subtitleIcon} fontSize="inherit" />
                    {typeof nodeSubtitle === "function" ? nodeSubtitle({ node, path, treeIndex }) : nodeSubtitle}
                  </Typography>
                </div>

                <div className={classes.rowToolbar}>
                  {buttons.map((button, index) => (
                    <div
                      key={index} // eslint-disable-line react/no-array-index-key
                      className={classes.toolbarButton}
                    >
                      {button}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Card>

      </div>
    );

    return canDrag
      ? connectDragSource(nodeContent, { dropEffect: "copy" })
      : nodeContent;
  }
}

export default withStyles(styles, { name: "RuiSortableNodeContentRenderer" })(SortableNodeContentRenderer);
