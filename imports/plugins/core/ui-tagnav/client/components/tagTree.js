import React, { Component, PropTypes } from "react";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";
import TagTreeHeader from "./tagTreeHeader";
import TagTreeBody from "./tagTreeBody";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import update from "react/lib/update";
import { getTagIds } from "/lib/selectors/tags";

class TagTree extends Component {
  constructor(props) {
    super(props);

    const { parentTag, tagsByKey, tagIds } = props.tagTreeProps;
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

  get tags() {
    if (this.props.editable) {
      return this.state.tagIds.map((tagId) => this.state.tagsByKey[tagId]);
    }

    return this.props.tagTreeProps.subTagGroups;
  }

  get className() {
    if (this.props.blank) {
      return "create";
    }
    return "";
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

  handleNewTagSave = (event, tag) => {
    if (this.props.onNewTagSave) {
      this.props.onNewTagSave(tag, this.props.tagTreeProps.parentTag);
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

  tagTreeBodyProps = (tag) => {
    const subTagGroups = _.compact(TagHelpers.subTags(tag));
    const tagsByKey = {};

    if (Array.isArray(subTagGroups)) {
      for (const tagItem of subTagGroups) {
        tagsByKey[tagItem._id] = tagItem;
      }
    }

    return {
      parentTag: tag,
      tagsByKey: tagsByKey || {},
      tagIds: getTagIds({ tags: subTagGroups }) || [],
      subTagGroups
    };
  }

  renderTree(tags) {
    if (Array.isArray(tags)) {
      return tags.map((tag) => (
        <div className={`rui grouptag ${this.className}`} data-id={tag._id} key={tag._id}>
          <TagTreeHeader
            tag={tag}
            parentTag={this.state.parentTag}
            editable={this.props.editable}
            onTagRemove={this.props.onTagRemove}
          />
          <TagTreeBody
            {...this.props}
            tagTreeBodyProps={this.tagTreeBodyProps(tag)}
            editable={this.props.editable}
          />
        </div>
      ));
    }
  }

  render() {
    return (
      <div className="rui tagtree">
        <div className="header">
          <span className="title">{this.state.parentTag.name}</span>
          <a href="#">View All <i className="fa fa-angle-right" /></a>
        </div>
        <div className="content">
          {this.renderTree(this.tags)}
          {this.props.editable &&
            <div className="rui grouptag create">
              <div className="header">
                <TagItem
                  blank={true}
                  tag={this.state.newTag}
                  key="newTagForm"
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
            </div>
          }
        </div>
      </div>
    );
  }
}

TagTree.propTypes = {
  blank: PropTypes.bool,
  editable: PropTypes.bool,
  onClearSuggestions: PropTypes.func,
  onGetSuggestions: PropTypes.func,
  onMove: PropTypes.func,
  onNewTagSave: PropTypes.func,
  onNewTagUpdate: PropTypes.func,
  onTagInputBlur: PropTypes.func,
  onTagMouseOut: PropTypes.func,
  onTagMouseOver: PropTypes.func,
  onTagRemove: PropTypes.func,
  onTagSave: PropTypes.func,
  onTagUpdate: PropTypes.func,
  tagTreeProps: PropTypes.object
};

export default TagTree;
