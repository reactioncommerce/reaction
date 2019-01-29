import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Button from "@reactioncommerce/components/Button/v1";
import Grid from "@material-ui/core/Grid";
import NavigationTreeNode from "../../NavigationTreeNode";

const Wrapper = styled.div`
  border-left: 1px solid #ccc;
`;

const HeaderWrapper = styled.div`
  border-bottom: 1px solid #ccc;
  padding: 20px;

  .nav-save-changes {
    margin-right: 20px;
  }
`;

const ContentWrapper = styled.div`
  padding: 40px 80px;
  min-height: calc(100vh - 140px);
`;

const NavigationName = styled.h4`
  margin: 0;
  margin-top: 12px;
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
    onToggleChildrenVisibility: PropTypes.func,
    overNavigationItemId: PropTypes.string
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
    return (
      <Wrapper>
        <ContentWrapper>
          <Grid container>
            <Grid item xs={12}>
              <p>Drag and drop pages and tags from the left column into the navigation structure.</p>
            </Grid>
          </Grid>
          <NavigationItemsListContainer>
            {this.renderRows()}
          </NavigationItemsListContainer>
        </ContentWrapper>
      </Wrapper>
    );
  }
}

export default NavigationTreeContainer;
