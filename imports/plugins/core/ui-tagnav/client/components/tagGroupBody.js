import _ from "lodash";
import React, { Component } from "react";
import update from "immutability-helper";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class TagGroupBody extends Component {
  constructor(props) {
    super(props);

    const { parentTag, tagsByKey, tagIds } = props.tagGroupBodyProps;
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

  componentWillReceiveProps(nextProps) {
    const { parentTag, tagsByKey, tagIds } = nextProps.tagGroupBodyProps;
    this.setState({ tagIds, parentTag, tagsByKey });
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
    const suggestions = this.props.updateSuggestions(
      suggestionUpdateRequest.value,
      { excludeTags: this.state.tagIds }
    );

    this.setState({ suggestions });
  }

  handleClearSuggestions = () => {
    this.setState({ suggestions: [] });
  }

  handleMoveTag = (dragIndex, hoverIndex) => {
    const tag = this.state.tagIds[dragIndex];
    if (!tag) {
      return false;
    }
    // Apply new sort order to variant list
    const newState = update(this.state, {
      tagIds: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, tag]
        ]
      }
    });

    // Set local state so the component does't have to wait for a round-trip
    // to the server to get the updated list of variants
    this.setState(newState, () => {
      _.debounce(() => this.props.onTagSort(this.state.tagIds, this.state.parentTag), 500)();
    });
  }

  handleTagSave = (event, tag) => {
    if (this.props.onUpdateTag) {
      this.props.onUpdateTag(tag._id, tag.name, this.state.parentTag._id);
    }
  }

  get tags() {
    if (this.props.editable) {
      return this.state.tagIds.map((tagId) => this.state.tagsByKey[tagId]);
    }

    return this.props.tagGroupBodyProps.subTagGroups;
  }

  genTagsList(tags, parentTag) {
    if (Array.isArray(tags)) {
      return tags.map((tag, index) => (
        <Components.TagItem
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
          onTagSave={this.handleTagSave}
          onTagSelect={this.onTagSelect}
          onTagUpdate={this.handleTagUpdate}
          onTagClick={this.props.onTagClick}
        />
      ));
    }
  }

  render() {
    return (
      <div className="content">
        <div className="rui tags" data-id={this.state.parentTag._id}>
          {this.genTagsList(_.compact(this.tags), this.state.parentTag)}
          {this.props.editable &&
            <div className="rui item create">
              <Components.TagItem
                blank={true}
                key="newTagForm"
                tag={this.state.newTag}
                inputPlaceholder="Add Tag"
                i18nKeyInputPlaceholder="tags.addTag"
                suggestions={this.state.suggestions}
                onClearSuggestions={this.handleClearSuggestions}
                onGetSuggestions={this.handleGetSuggestions}
                onMoveTag={this.handleMoveTag}
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

TagGroupBody.propTypes = {
  editable: PropTypes.bool,
  onNewTagSave: PropTypes.func,
  onTagClick: PropTypes.func,
  onTagRemove: PropTypes.func,
  onTagSort: PropTypes.func,
  onUpdateTag: PropTypes.func,
  tagGroupBodyProps: PropTypes.object,
  updateSuggestions: PropTypes.func
};

registerComponent("TagGroupBody", TagGroupBody);

export default TagGroupBody;
