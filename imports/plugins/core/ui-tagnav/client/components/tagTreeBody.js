import debounce from "lodash/debounce";
import update from "react/lib/update";
import React, { Component, PropTypes } from "react";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";

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

  componentWillReceiveProps(nextProps) {
    const { parentTag, tagsByKey, tagIds } = nextProps.tagTreeBodyProps;
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
      debounce(() => this.props.onTagSort(this.state.tagIds, this.state.parentTag), 500)();
    });
  }

  handleRemoveTag = (a, b) => {
    console.log('test', { a, b });
    return;
    const tag = this.state.tagIds[dragIndex];

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
      debounce(() => this.props.onTagSort(this.state.tagIds, this.state.parentTag), 500)();
    });

    // ....
    const movedTagId = event.item.dataset.id;
    const foundTag = _.find(instance.data.tags, (tag) => {
      return tag._id === movedTagId;
    });

    TagNavHelpers.onTagRemove(foundTag, instance.data.parentTag);
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
            onClearSuggestions={this.handleClearSuggestions}
            onGetSuggestions={this.handleGetSuggestions}
            onMove={this.handleMoveTag}
            onTagInputBlur={this.handleTagSave}
            onTagMouseOut={this.handleTagMouseOut}
            onTagMouseOver={this.handleTagMouseOver}
            onTagRemove={this.props.onTagRemove}
            onRemove={this.handleRemoveTag}
            onDragRemove={this.handleRemoveTag}
            onDrag={this.handleRemoveTag}
            onTagSave={this.handleTagSave}
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

TagTreeBody.propTypes = {
  editable: PropTypes.bool,
  onClearSuggestions: PropTypes.func,
  onGetSuggestions: PropTypes.func,
  onNewTagSave: PropTypes.func,
  onTagRemove: PropTypes.func,
  onTagSort: PropTypes.func,
  onUpdateTag: PropTypes.func,
  tagTreeBodyProps: PropTypes.object,
  updateSuggestions: PropTypes.func
};

export default TagTreeBody;
