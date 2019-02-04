import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import NavigationItemCard from "./NavigationItemCard";

const Wrapper = styled.div`
  padding: 20px;
`;

const LinkContainer = styled.div`
  margin: 20px 0px;
  text-align: right;

  .add-nav-item-link {
    font-weight: 700;
  }
`;

class PagesList extends Component {
  static propTypes = {
    navigationItems: PropTypes.array,
    onClickAddNavigationItem: PropTypes.func,
    onClickUpdateNavigationItem: PropTypes.func,
    onSetDraggingNavigationItemId: PropTypes.func
  }

  renderNavigationItems() {
    const { navigationItems, onClickUpdateNavigationItem, onSetDraggingNavigationItemId } = this.props;
    if (navigationItems) {
      return navigationItems.map((navigationItem) => {
        const row = { node: { navigationItem } };
        return (
          <NavigationItemCard
            row={row}
            key={navigationItem._id}
            onClickUpdateNavigationItem={onClickUpdateNavigationItem}
            onSetDraggingNavigationItemId={onSetDraggingNavigationItemId}
          />
        );
      });
    }
    return null;
  }

  render() {
    const { onClickAddNavigationItem } = this.props;
    return (
      <Wrapper>
        <LinkContainer>
          <Button color="primary" variant="outlined" onClick={onClickAddNavigationItem}>Add navigation item</Button>
        </LinkContainer>
        {this.renderNavigationItems()}
      </Wrapper>
    );
  }
}

export default PagesList;
