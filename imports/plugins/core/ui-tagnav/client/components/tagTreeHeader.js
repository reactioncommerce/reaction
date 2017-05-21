import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
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

  handleTagUpdate = (event, tag) => {
    this.setState({ tag: tag });
  }

  handleGetSuggestions = (suggestionUpdateRequest) => {
    const suggestions = TagHelpers.updateSuggestions(
      suggestionUpdateRequest.value,
      { excludeTags: this.state.tagIds }
    );

    this.setState({ suggestions });
  }

  handleTagSave = (event, tag) => {
    if (this.props.onTagSave) {
      this.props.onTagSave(tag);
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
          onMove={this.props.onMove}
          onTagMouseOut={this.props.onTagMouseOut}
          onTagMouseOver={this.props.onTagMouseOver}
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
  onTagSave: PropTypes.func,
  parentTag: PropTypes.object,
  tag: PropTypes.object
};

export default TagTreeHeader;
