import React, { Component, PropTypes } from "react";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";

class TagTreeHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: []
    };
  }

  render() {
    return (
      <div className="header">
        <TagItem
          tag={this.props.tag}
          selectable={true}
          className="js-tagNav-item"
          editable={this.props.editable}
          isSelected={this.isSelected}
          suggestions={this.state.suggestions}
          parentTag={this.props.parentTag}
          onClearSuggestions={this.props.onClearSuggestions}
          onGetSuggestions={this.props.onGetSuggestions}
          onMove={this.props.onMove}
          onTagInputBlur={this.props.onTagInputBlur}
          onTagMouseOut={this.props.onTagMouseOut}
          onTagMouseOver={this.props.onTagMouseOver}
          onTagRemove={this.props.onTagRemove}
          onTagSave={this.props.onTagSave}
          onTagUpdate={this.handleTagUpdate}
        />
      </div>
    );
  }
}

TagTreeHeader.propTypes = {
  parentTag: PropTypes.object
};

export default TagTreeHeader;
