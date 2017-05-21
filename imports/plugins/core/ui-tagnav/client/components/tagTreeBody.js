import React, { Component, PropTypes } from "react";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import update from "react/lib/update";

class TagTreeBody extends Component {
  constructor(props) {
    super(props);

    const { parentTag, tagsByKey, tagIds } = props.tagTreeBodyProps;
    this.state = {
      suggestions: [],
      newTag: {
        name: ""
      },
      tagIds,
      parentTag,
      tagsByKey
    };
  }

  handleNewTagSave = (event, tag) => {
    if (this.props.onNewTagSave) {
      this.props.onNewTagSave(tag, this.state.parentTag);
      this.setState({
        newTag: { name: "" }
      });
    }
  }

  handleTagUpdate = (event, tag) => {
    const newState = update(this.state, {
      tagsByKey: {
        [tag._id]: {
          $set: tag
        }
      }
    });

    this.setState(newState);
  }

  handleNewTagUpdate = (event, tag) => { // updates blank tag state being edited
    this.setState({ newTag: tag });
  }

  handleGetSuggestions = (suggestionUpdateRequest) => {
    const suggestions = TagHelpers.updateSuggestions(
      suggestionUpdateRequest.value,
      { excludeTags: this.state.tagIds }
    );

    this.setState({ suggestions });
  }

  handleClearSuggestions = () => {
    this.setState({ suggestions: [] });
  }


  get tags() {
    if (this.props.editable) {
      return this.state.tagIds.map((tagId) => this.state.tagsByKey[tagId]);
    }

    return this.props.tagTreeBodyProps.subTagGroups;
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
        <div className="rui tags" data-id={this.state.parentTag._id}>
          {this.genTagsList(this.tags, this.state.parentTag)}
          {this.props.editable &&
            <div className="rui item create">
              <TagItem
                blank={true}
                key="newTagForm"
                tag={this.state.newTag}
                inputPlaceholder="Add Tag"
                i18nKeyInputPlaceholder="tags.addTag"
                suggestions={this.state.suggestions}
                onClearSuggestions={this.handleClearSuggestions}
                onGetSuggestions={this.handleGetSuggestions}
                onTagInputBlur={this.handleNewTagSave}
                onTagSave={this.handleNewTagSave}
                onTagUpdate={this.handleNewTagUpdate}
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
  onClearSuggestions: PropTypes.func,
  onGetSuggestions: PropTypes.func,
  onNewTagSave: PropTypes.func,
  onTagRemove: PropTypes.func,
  tagTreeBodyProps: PropTypes.object
};

export default TagTreeBody;
