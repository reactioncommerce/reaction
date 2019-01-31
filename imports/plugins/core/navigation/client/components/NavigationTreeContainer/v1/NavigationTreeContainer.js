import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Grid from "@material-ui/core/Grid";
import { SortableTreeWithoutDndContext as SortableTree } from "react-sortable-tree";
import "react-sortable-tree/style.css";
import NavigationTreeNode from "../../NavigationTreeNode";


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
    const { onSetSortableNavigationTree, sortableNavigationTree } = this.props;
    return (
      <Wrapper>
        <ContentWrapper>
          <Grid container>
            <Grid item xs={12}>
              <p>Drag and drop pages and tags from the left column into the navigation structure.</p>
            </Grid>
          </Grid>

          <div style={{ height: 400 }}>
            <SortableTree
              treeData={sortableNavigationTree}
              onChange={onSetSortableNavigationTree}
            />
          </div>

          <NavigationItemsListContainer>
            {this.renderRows()}
          </NavigationItemsListContainer>
        </ContentWrapper>
      </Wrapper>
    );
  }
}

export default NavigationTreeContainer;
