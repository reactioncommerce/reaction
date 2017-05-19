import React, { Component, PropTypes } from "react";
import { PropTypes as ReactionPropTypes } from "/lib/api";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";

class TagTreeBody extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      newTag: {
        name: ""
      }
    };
  }

  genTagsList(tags, parentTag) {
    if (Array.isArray(tags)) {
      return tags.map((tag, index) => {
        return (
          <TagItem
            tag={tag}
            index={index}
            key={index}
            data-id={tag._id}
            editable={this.props.editable}
            isSelected={this.isSelected}
            parentTag={parentTag}
            draggable={true}
            selectable={true}
            suggestions={this.state.suggestions}
            onClearSuggestions={this.handleClearSuggestions}
            onGetSuggestions={this.handleGetSuggestions}
            onMove={this.handleMoveTag}
            onTagInputBlur={this.handleTagSave}
            onTagMouseOut={this.handleTagMouseOut}
            onTagMouseOver={this.handleTagMouseOver}
            onTagRemove={this.props.onTagRemove}
            onTagSelect={this.onTagSelect}
            onTagUpdate={this.handleTagUpdate}
          />
        );
      });
    }
  }

  render() {
    return (
      <div className="content">
        <div className="rui tags" data-id={this.props.parentTag._id}>
          {this.genTagsList(this.props.tags, this.props.parentTag)}
          {this.props.editable &&
            <div className="rui item create">
              <TagItem
                blank={true}
                key="newTagForm"
                tag={this.state.newTag}
                inputPlaceholder="Add Tag"
                i18nKeyInputPlaceholder="tags.addTag"
                suggestions={this.state.suggestions}
                onClearSuggestions={this.props.onClearSuggestions}
                onGetSuggestions={this.props.onGetSuggestions}
                onTagInputBlur={this.handleNewTagSave(this.props.parentTag)}
                onTagSave={this.handleNewTagSave(this.props.parentTag)}
                onTagUpdate={this.handleNewTagUpdate(this.props.parentTag.name)}
              />
            </div>
          }
        </div>
      </div>
    );
  }
}

TagTreeBody.propTypes = {
  editable: PropTypes.bool,
  parentTag: PropTypes.object,
  tags: ReactionPropTypes.arrayOfTags
};

export default TagTreeBody;
