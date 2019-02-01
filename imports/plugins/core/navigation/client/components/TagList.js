import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import NavigationItemCard from "./NavigationItemCard";

const Wrapper = styled.div`
  padding: 80px 20px;
`;

class TagsList extends Component {
  static propTypes = {
    tags: PropTypes.arrayOf(PropTypes.object)
  }

  renderTags() {
    const { tags } = this.props;
    if (tags) {
      return tags.map((tag) => {
        const row = { node: { tag: tag.node } };
        return <NavigationItemCard row={row} key={tag.node._id} />;
      });
    }
    return null;
  }

  render() {
    return (
      <Wrapper>
        {this.renderTags()}
      </Wrapper>
    );
  }
}

export default TagsList;
