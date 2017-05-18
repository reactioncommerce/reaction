import React, { Component, PropTypes } from "react";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";

class TagTree extends Component {
  constructor(props) {
    super(props);

    const state = {
      suggestions: [],
      newTopLevelTreeTag: {
        name: ""
      }
    };

    props.subTagGroups.map((tag) => {
      state[tag.name] = { name: "" };
    });

    this.state = state;
  }

  get className() {
    if (this.props.blank) {
      return "create";
    }
    return "";
  }

  // setting up the func before passing to TagItem
  handleNewTagSave = (parentTag) => {
    return (event, tag) => {
      event.preventDefault();
      if (this.props.onNewTagSave) {
        this.props.onNewTagSave(tag, parentTag);
      }
    };
  }

  handleNewTagUpdate = (key) => { // updates the current tag state being edited
    return (event, tag) => {
      this.setState({ [key]: tag });
    };
  }

  genTagsList(tags, parentTag) {
    if (_.isArray(tags)) {
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

  renderSubTags(props) {
    return (
      <div className="rui tags" data-id={props.parentTag._id}>
        {this.genTagsList(props.tags, props.parentTag)}
      </div>
    );
  }

  // renders both the TagTree Header and the TagTree subtags
  renderTreeTags(tags) {
    if (_.isArray(tags)) {
      return tags.map((tag, index) => (
        <div className={`rui grouptag ${this.className}`} data-id={tag._id} key={tag._id}>
          <div className="header">
            <TagItem
              tag={tag}
              index={index}
              key={index}
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
              onTagUpdate={this.props.onTagUpdate}
            />
          </div>
          <div className="content">
            {
              this.renderSubTags({
                parentTag: tag,
                tags: TagHelpers.subTags(tag)
              })
            }
            {this.props.editable &&
              <div className="rui item create">
                <TagItem
                  blank={true}
                  key="newTagForm"
                  tag={this.state[tag.name]}
                  inputPlaceholder="Add Tag"
                  i18nKeyInputPlaceholder="tags.addTag"
                  suggestions={this.state.suggestions}
                  onClearSuggestions={this.props.onClearSuggestions}
                  onGetSuggestions={this.props.onGetSuggestions}
                  onTagInputBlur={this.handleNewTagSave(tag)}
                  onTagSave={this.handleNewTagSave(tag)}
                  onTagUpdate={this.handleNewTagUpdate(tag.name)}
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
          {this.renderTreeTags(this.props.subTagGroups)}
          {this.props.editable &&
            <div className="rui grouptag create">
              <div className="header">
                <TagItem
                  blank={true}
                  tag={this.state.newTopLevelTreeTag}
                  key="newTagForm"
                  inputPlaceholder="Add Tag"
                  i18nKeyInputPlaceholder="tags.addTag"
                  suggestions={this.state.suggestions}
                  onClearSuggestions={this.handleClearSuggestions}
                  onGetSuggestions={this.handleGetSuggestions}
                  onTagInputBlur={this.handleNewTagSave(this.props.parentTag)}
                  onTagSave={this.handleNewTagSave(this.props.parentTag)}
                  onTagUpdate={this.handleNewTagUpdate("newTopLevelTreeTag")}
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
