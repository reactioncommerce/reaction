import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import getTagSuggestions from "/imports/plugins/core/ui-tagnav/client/util/getTagSuggestions";

class TagGroupHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      tag: this.props.tag
    };
  }

  handleGetSuggestions = async (suggestionUpdateRequest) => {
    const suggestions = await getTagSuggestions(
      suggestionUpdateRequest.value,
      { excludeTags: this.state.tagIds }
    );

    this.setState({ suggestions });
  }

  handleTagUpdate = (event, tag) => {
    this.setState({ tag });
  }

  handleTagSave = (event, tag) => {
    if (this.props.onUpdateTag) {
      this.props.onUpdateTag(tag._id, tag.name, this.props.parentTag._id);
    }
  }

  handleTagTreeMove = () => {
    // needed to prevent move errors, pending fix for TagGroup draging
  }

  render() {
    return (
      <div className="header">
        <Components.TagItem
          tag={this.state.tag}
          parentTag={this.props.parentTag}
          selectable={true}
          className="js-tagNav-item"
          editable={this.props.editable}
          isSelected={this.isSelected}
          suggestions={this.state.suggestions}
          onClearSuggestions={this.handleClearSuggestions}
          onGetSuggestions={this.handleGetSuggestions}
          onMove={this.handleTagTreeMove}
          onTagRemove={this.props.onTagRemove}
          onTagSave={this.handleTagSave}
          onTagInputBlur={this.handleTagSave}
          onTagUpdate={this.handleTagUpdate}
          onTagClick={this.props.onTagClick}
        />
      </div>
    );
  }
}

TagGroupHeader.propTypes = {
  editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  onTagClick: PropTypes.func,
  onTagRemove: PropTypes.func,
  onUpdateTag: PropTypes.func,
  parentTag: PropTypes.object,
  tag: PropTypes.object
};

registerComponent("TagGroupHeader", TagGroupHeader);

export default TagGroupHeader;
