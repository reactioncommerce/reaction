import React, { Component, PropTypes } from "react";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";

class TagTree extends Component {
  static propTypes = {
    editable: PropTypes.bool,
    onTagRemove: PropTypes.func,
    onTagSave: PropTypes.func,
    parentTag: PropTypes.object,
    subTagGroups: PropTypes.arrayOf(PropTypes.object)
  }

  get className() {
    if (this.props.blank) {
      return "create";
    }
    return "";
  }

  suggestions = [{}]

  newTag = {
    name: ""
  }

  tagListProps(groupTag) {
    return {
      parentTag: groupTag,
      tags: TagHelpers.subTags(groupTag),
      editable: this.props.editable,
      onTagCreate(tagName) {
        if (this.props.onTagCreate) {
          this.props.onTagCreate(tagName, groupTag);
        }
      },
      onTagRemove(tag) {
        this.props.onTagRemove(tag, groupTag);
      },
      onTagSort(newTagsOrder) {
        this.props.onTagSort(newTagsOrder, groupTag);
      },
      onTagDragAdd: this.props.onTagDragAdd,
      onTagUpdate: this.props.onTagUpdate
    };
  }

  genTagsList(tags) {
    if (_.isArray(tags)) {
      return tags.map((tag, index) => {
        return (
          <TagItem
            data-id={tag._id}
            editable={this.props.editable}
            index={index}
            isSelected={this.isSelected}
            key={index}
            draggable={true}
            onClearSuggestions={this.handleClearSuggestions}
            onGetSuggestions={this.handleGetSuggestions}
            onMove={this.handleMoveTag}
            onTagInputBlur={this.handleTagSave}
            onTagMouseOut={this.handleTagMouseOut}
            onTagMouseOver={this.handleTagMouseOver}
            onTagRemove={this.handleTagRemove}
            onTagSelect={this.onTagSelect}
            selectable={true}
            onTagUpdate={this.handleTagUpdate}
            suggestions={this.suggestions}
            tag={tag}
          />
        );
      });
    }
  }

  renderTagList(props) {
    return (
      <div className="rui tags" data-id={props.parentTag._id}>
        {this.genTagsList(props.tags)}
      </div>
    );
  }

  renderSubTagGroups(subTagGroups) {
    if (_.isArray(subTagGroups)) {
      // Tag Group
      return subTagGroups.map((groupTag, index) => (
        <div className={`rui grouptag ${this.className}`} data-id={groupTag._id} key={groupTag._id}>
          <div className="header">
            <TagItem
              className="js-tagNav-item"
              editable={this.props.editable}
              index={index}
              isSelected={this.isSelected}
              key={index}
              onTagRemove={this.handleTagRemove}
              onTagSave={this.props.onTagSave}
              onTagSelect={this.onTagSelect}
              selectable={true}
              onTagUpdate={this.handleTagUpdate}
              suggestions={this.suggestions}
              tag={groupTag}
            />
          </div>
          <div className="content">
            {this.renderTagList(this.tagListProps(groupTag))}
            { this.props.editable &&
              <div className="rui item create">
                <TagItem
                  blank={true}
                  key="newTagForm"
                  onClearSuggestions={this.handleClearSuggestions}
                  onGetSuggestions={this.handleGetSuggestions}
                  onTagInputBlur={this.handleNewTagSave}
                  onTagSave={this.props.onTagSave}
                  inputPlaceholder="Add Tag"
                  i18nKeyInputPlaceholder="tags.addTag"
                  onTagUpdate={this.handleNewTagUpdate}
                  tag={this.newTag}
                  suggestions={this.suggestions}
                />
              </div>
            }
          </div>
        </div>
      ));
    }
  }

  render() {
    return (
      <div className="rui tagtree">
        <div className="header">
          <span className="title">{this.props.parentTag.name}</span>
          <a href="#">View All <i className="fa fa-angle-right" /></a>
        </div>
        <div className="content">
          {this.renderSubTagGroups(this.props.subTagGroups)}
          {this.props.editable &&
            <div className="rui grouptag create">
              <div className="header">
                <TagItem
                  blank={true}
                  tag={this.newTag}
                  key="newTagForm"
                  onClearSuggestions={this.handleClearSuggestions}
                  onGetSuggestions={this.handleGetSuggestions}
                  inputPlaceholder="Add Tag"
                  i18nKeyInputPlaceholder="tags.addTag"
                  onTagSave={this.props.onTagSave}
                  suggestions={this.suggestions}
                />
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default TagTree;
