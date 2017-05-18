import React, { Component, PropTypes } from "react";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";

class TagTree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      newTagOnList: {
        name: ""
      },
      newTagOnTree: {
        name: ""
      }
    };
  }

  get className() {
    if (this.props.blank) {
      return "create";
    }
    return "";
  }

  // setting up the func before passing to TagItem
  handleNewTagSave = (event, tag) => {
    console.log('handling NewTagSave');
    event.preventDefault();
    if (this.props.onNewTagSave) {
      this.props.onNewTagSave(tag, this.props.parentTag);
    }
  }

  handleNewTagUpdate = (key) => { // updates the current tag state being edited
    return (event, tag) => {
      console.log(tag);
      this.setState({ [key]: tag });
    };
  }

  tagListProps(groupTag) {
    return {
      parentTag: groupTag,
      tags: TagHelpers.subTags(groupTag),
      editable: this.props.editable
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
            onTagRemove={this.props.onTagRemove}
            onTagSelect={this.onTagSelect}
            selectable={true}
            onTagUpdate={this.handleTagUpdate}
            suggestions={this.state.suggestions}
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
              key={index}
              selectable={true}
              isSelected={this.isSelected}
              suggestions={this.state.suggestions}
              tag={groupTag}
              parentTag={this.props.parentTag}
              onClearSuggestions={this.props.onClearSuggestions}
              onGetSuggestions={this.props.onGetSuggestions}
              onMove={this.props.onMove}
              onTagInputBlur={this.props.onTagInputBlur}
              onTagMouseOut={this.props.onTagMouseOut}
              onTagMouseOver={this.props.onTagMouseOver}
              onTagRemove={this.props.onTagRemove}
              onTagSave={this.props.onTagSave}
              onTagUpdate={this.props.onTagUpdate}
            />
          </div>
          <div className="content">
            {this.renderTagList(this.tagListProps(groupTag))}
            {this.props.editable &&
              <div className="rui item create">
                <TagItem
                  blank={true}
                  key="newTagForm"
                  tag={this.state.newTagOnList}
                  inputPlaceholder="Add Tag"
                  i18nKeyInputPlaceholder="tags.addTag"
                  suggestions={this.state.suggestions}
                  onClearSuggestions={this.props.onClearSuggestions}
                  onGetSuggestions={this.props.onGetSuggestions}
                  onTagInputBlur={this.handleNewTagSave}
                  onTagSave={this.handleNewTagSave}
                  onTagUpdate={this.handleNewTagUpdate("newTagOnList")}
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
                  tag={this.state.newTagOnTree}
                  key="newTagForm"
                  inputPlaceholder="Add Tag"
                  i18nKeyInputPlaceholder="tags.addTag"
                  suggestions={this.state.suggestions}
                  onClearSuggestions={this.handleClearSuggestions}
                  onGetSuggestions={this.handleGetSuggestions}
                  onTagInputBlur={this.handleNewTagSave}
                  onTagSave={this.handleNewTagSave}
                  onTagUpdate={this.handleNewTagUpdate("newTagOnTree")}
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
  parentTag: PropTypes.object,
  subTagGroups: PropTypes.arrayOf(PropTypes.object)
};

export default TagTree;
