import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Link from "@reactioncommerce/components/Link/v1";
import NavigationItemCard from "../../NavigationItemCard/v1";

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
          <Link onClick={onClickAddNavigationItem} className="add-nav-item-link">Add navigation item</Link>
        </LinkContainer>
        {this.renderNavigationItems()}
      </Wrapper>
    );
  }
}

export default PagesList;
