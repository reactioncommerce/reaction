import React, { Component, PropTypes } from "react";
import { PropTypes as ReactionPropTypes } from "/lib/api";
import { TagItem } from "./";
import classnames from "classnames";
import Sortable from "sortablejs";

class Tags extends Component {
  displayName = "Tag List (Tags)";

  handleNewTagSubmit = (event) => {
    event.preventDefault();
    if (this.props.onTagCreate) {
      this.props.onTagCreate(event.target.tag.value, this.props.parentTag);
    }
  };

  handleTagCreate = (tagId, tagName) => {
    if (this.props.onTagCreate) {
      this.props.onTagCreate(tagId, tagName);
    }
  };

  handleTagRemove = (tag) => {
    if (this.props.onTagRemove) {
      this.props.onTagRemove(tag, this.props.parentTag);
    }
  };

  /**
   * Handle tag mouse out events and pass them up the component chain
   * @param  {Event} event Event object
   * @param  {Tag} tag Reaction.Schemas.Tag - a tag object
   * @return {void} no return value
   */
  handleTagMouseOut = (event, tag) => {
    if (this.props.onTagMouseOut) {
      this.props.onTagMouseOut(event, tag);
    }
  };

  /**
   * Handle tag mouse over events and pass them up the component chain
   * @param  {Event} event Event object
   * @param  {Tag} tag Reaction.Schemas.Tag - a tag object
   * @return {void} no return value
   */
  handleTagMouseOver = (event, tag) => {
    if (this.props.onTagMouseOver) {
      this.props.onTagMouseOver(event, tag);
    }
  };


  handleTagUpdate = (event, tag) => {
    if (this.props.onTagUpdate) {
      this.props.onTagUpdate(tag, this.props.parentTag);
    }
  };

  handleTagBookmark = (event) => {
    event;
    // handle event
  };

  renderTags() {
    if (_.isArray(this.props.tags)) {
      const tags = this.props.tags.map((tag, index) => {
        if (tag) {
          return (
            <TagItem
              data-id={tag._id}
              editable={this.props.editable}
              index={index}
              key={index}
              onGetSuggestions={this.props.handleGetSuggestions}
              onMove={this.props.onMoveTag}
              onSuggestionUpdateRequested={this.props.onSuggestionUpdateRequested}
              onTagBookmark={this.handleTagBookmark}
              onTagMouseOut={this.handleTagMouseOut}
              onTagMouseOver={this.handleTagMouseOver}
              onTagRemove={this.handleTagRemove}
              onTagSave={this.handleTagUpdate}
              suggestions={this.props.suggestions}
              tag={tag}
            />
          );
        }
      });

      // Render an blank tag for creating new tags
      if (this.props.editable && this.props.enableNewTagForm) {
        tags.push(
          <TagItem
            blank={true}
            key="newTagForm"
            onGetSuggestions={this.props.handleGetSuggestions}
            onTagCreate={this.handleTagCreate}
            onTagSave={this.props.onNewTagInputBlur}
            suggestions={this.props.suggestions}
            tag={{
              name: ""
            }}
          />
        );
      }

      return tags;
    }
  }

  render() {
    const classes = classnames({
      rui: true,
      tags: true,
      edit: this.props.editable
    });

    return (
      <div
        className={classes}
        data-id={this.props.parentTag._id}
        ref="tags"
      >
        {this.renderTags()}
      </div>
    );
  }
}

// Default Props
Tags.defaultProps = {
  parentTag: {}
};

// Prop Types
Tags.propTypes = {
  editable: PropTypes.bool,
  enableNewTagForm: PropTypes.bool,

  // Event handelers
  onTagBookmark: PropTypes.func,
  onTagCreate: PropTypes.func,
  onTagDragAdd: PropTypes.func,
  onTagMouseOut: PropTypes.func,
  onTagMouseOver: PropTypes.func,
  onTagRemove: PropTypes.func,
  onTagSort: PropTypes.func,
  onTagUpdate: PropTypes.func,

  parentTag: ReactionPropTypes.Tag,
  placeholder: PropTypes.string,
  showBookmark: PropTypes.bool,
  // tag: PropTypes.Tag
  tags: ReactionPropTypes.arrayOfTags
};

// Export
export default Tags;
