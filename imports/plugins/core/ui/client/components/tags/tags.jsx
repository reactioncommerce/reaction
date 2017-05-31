import React, { Component, PropTypes } from "react";
import { PropTypes as ReactionPropTypes } from "/lib/api";
import { TagItem } from "./";
import classnames from "classnames";

class Tags extends Component {
  displayName = "Tag List (Tags)";

  handleNewTagSave = (event, tag) => {
    event.preventDefault();
    if (this.props.onNewTagSave) {
      this.props.onNewTagSave(tag, this.props.parentTag);
    }
  };

  handleNewTagUpdate = (event, tag) => {
    if (this.props.onNewTagUpdate) {
      this.props.onNewTagUpdate(tag, this.props.parentTag);
    }
  }

  handleTagSave = (event, tag) => {
    if (this.props.onTagSave) {
      this.props.onTagSave(tag, this.props.parentTag);
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
      this.props.onTagMouseOut(event, tag, this.props.parentTag);
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
      this.props.onTagMouseOver(event, tag, this.props.parentTag);
    }
  };


  handleTagUpdate = (event, tag) => {
    if (this.props.onTagUpdate) {
      this.props.onTagUpdate(tag, this.props.parentTag);
    }
  };

  hasDropdownClassName = (tag) => {
    if (this.props.hasDropdownClassName) {
      return this.props.hasDropdownClassName(tag);
    }
    return "";
  }

  navbarSelectedClassName = (tag) => {
    if (this.props.navbarSelectedClassName) {
      return this.props.navbarSelectedClassName(tag);
    }
    return "";
  }

  renderTags() {
    const classes = (tag = {}) => classnames({
      "navbar-item": this.props.isTagNav,
      [this.navbarSelectedClassName(tag)]: this.props.isTagNav,
      [this.hasDropdownClassName(tag)]: this.props.isTagNav
    });

    if (_.isArray(this.props.tags)) {
      const tags = this.props.tags.map((tag, index) => {
        return (
          <div className={classes(tag)} key={index}>
            <TagItem
              {...this.props}
              data-id={tag._id}
              index={index}
              key={index}
              tag={tag}
              onMove={this.props.onMoveTag}
              draggable={this.props.draggable}
              onTagInputBlur={this.handleTagSave}
              onTagMouseOut={this.handleTagMouseOut}
              onTagMouseOver={this.handleTagMouseOver}
              onTagRemove={this.handleTagRemove}
              onTagSave={this.handleTagSave}
              onTagUpdate={this.handleTagUpdate}
            />
            {this.props.children}
          </div>
        );
      });

      // Render an blank tag for creating new tags
      if (this.props.editable && this.props.enableNewTagForm) {
        tags.push(
          <div className={classes()} key="newTagForm">
            <TagItem
              {...this.props}
              blank={true}
              key="newTagForm"
              tag={this.props.newTag}
              inputPlaceholder="Add Tag"
              i18nKeyInputPlaceholder="tags.addTag"
              onTagInputBlur={this.handleNewTagSave}
              onTagSave={this.handleNewTagSave}
              onTagUpdate={this.handleNewTagUpdate}
            />
          </div>
        );
      }

      return tags;
    }

    return null;
  }

  render() {
    if (this.props.isTagNav) {
      return (
        <div className="tag-group">
          {this.renderTags()}
        </div>
      );
    }

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
  children: PropTypes.node,
  editable: PropTypes.bool,
  enableNewTagForm: PropTypes.bool,
  hasDropdownClassName: PropTypes.func,
  isTagNav: PropTypes.bool,
  navbarSelectedClassName: PropTypes.func,
  newTag: PropTypes.object,
  onClearSuggestions: PropTypes.func,
  onGetSuggestions: PropTypes.func,
  onMoveTag: PropTypes.func,
  onNewTagSave: PropTypes.func,
  onNewTagUpdate: PropTypes.func,
  onTagMouseOut: PropTypes.func,
  onTagMouseOver: PropTypes.func,
  onTagRemove: PropTypes.func,
  onTagSave: PropTypes.func,
  onTagSort: PropTypes.func,
  onTagUpdate: PropTypes.func,
  parentTag: ReactionPropTypes.Tag,
  showBookmark: PropTypes.bool,
  suggestions: PropTypes.arrayOf(PropTypes.object),
  tags: ReactionPropTypes.arrayOfTags
};

// Export
export default Tags;
