import React, { Component, PropTypes } from "react";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";

class TagTreeHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      tag: this.props.tag
    };
  }

  handleGetSuggestions = (suggestionUpdateRequest) => {
    const suggestions = this.props.updateSuggestions(
      suggestionUpdateRequest.value,
      { excludeTags: this.state.tagIds }
    );

    this.setState({ suggestions });
  }

  handleTagUpdate = (event, tag) => {
    this.setState({ tag: tag });
  }

  handleTagSave = (event, tag) => {
    if (this.props.onUpdateTag) {
      this.props.onUpdateTag(tag._id, tag.name, this.props.parentTag._id);
    }
  }

  render() {
    return (
      <div className="header">
        <TagItem
          tag={this.state.tag}
          parentTag={this.props.parentTag}
          selectable={true}
          className="js-tagNav-item"
          editable={this.props.editable}
          isSelected={this.isSelected}
          suggestions={this.state.suggestions}
          onClearSuggestions={this.handleClearSuggestions}
          onGetSuggestions={this.handleGetSuggestions}
          onMove={this.handleMoveTag}
          onTagRemove={this.props.onTagRemove}
          onTagSave={this.handleTagSave}
          onTagInputBlur={this.handleTagSave}
          onTagUpdate={this.handleTagUpdate}
        />
      </div>
    );
  }
}

TagTreeHeader.propTypes = {
  editable: PropTypes.bool,
  onTagRemove: PropTypes.func,
  onUpdateTag: PropTypes.func,
  parentTag: PropTypes.object,
  tag: PropTypes.object,
  updateSuggestions: PropTypes.func
};

export default TagTreeHeader;
