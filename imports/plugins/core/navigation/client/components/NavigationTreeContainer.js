import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Grid from "@material-ui/core/Grid";
import withStyles from "@material-ui/core/styles/withStyles";
import { SortableTreeWithoutDndContext as SortableTree } from "react-sortable-tree";
import "react-sortable-tree/style.css";
import NavigationTreeNode from "./NavigationTreeNode";
import SortableTheme from "./SortableTheme";


const Wrapper = styled.div`
  border-left: 1px solid #ccc;
`;

const ContentWrapper = styled.div`
  padding: 40px 80px;
  min-height: calc(100vh - 140px);
`;

const NavigationItemsListContainer = styled.div`
  margin-top: 50px;
`;

const styles = (theme) => ({
  wrapper: {
    borderLeft: `1px solid ${theme.palette.divider}`
  }
});

class NavigationTreeContainer extends Component {
  static propTypes = {
    navigationTreeRows: PropTypes.array,
    onClickUpdateNavigationItem: PropTypes.func,
    onDragHover: PropTypes.func,
    onSetOverNavigationItemId: PropTypes.func,
    onSetSortableNavigationTree: PropTypes.func,
    onToggleChildrenVisibility: PropTypes.func,
    overNavigationItemId: PropTypes.string,
    sortableNavigationTree: PropTypes.arrayOf(PropTypes.object)
  }

  renderRows() {
    const { navigationTreeRows, onClickUpdateNavigationItem, onDragHover, onSetOverNavigationItemId, onToggleChildrenVisibility } = this.props;
    let rows = null;
    if (navigationTreeRows) {
      rows = navigationTreeRows.map((row, index) => (
        <NavigationTreeNode
          key={index}
          row={row}
          onClickUpdateNavigationItem={onClickUpdateNavigationItem}
          onDragHover={onDragHover}
          onSetOverNavigationItemId={onSetOverNavigationItemId}
          onToggleChildrenVisibility={onToggleChildrenVisibility}
        />
      ));
    }
    return rows;
  }

  render() {
    const { classes, onSetSortableNavigationTree, sortableNavigationTree } = this.props;
    return (
      <div className={classes.wrapper}>
        <ContentWrapper>
          <Grid container>
            <Grid item xs={12}>
              <p>Drag and drop pages and tags from the left column into the navigation structure.</p>
            </Grid>
          </Grid>

          <div style={{ height: "100vh" }}>
            <SortableTree
              treeData={sortableNavigationTree}
              onChange={onSetSortableNavigationTree}
              theme={SortableTheme}
              dndType={"CARD"}
            />
          </div>
        </ContentWrapper>
      </div>
    );
  }
}

export default withStyles(styles, { name: "RuiNavigationTreeContainer" })(NavigationTreeContainer);
