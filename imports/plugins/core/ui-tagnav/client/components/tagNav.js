import React, { Component, PropTypes } from "react";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";
import TagTree from "./tagTree";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";
import { EditButton } from "/imports/plugins/core/ui/client/components";

const styles = {
  editContainerItem: {
    display: "flex",
    marginLeft: 5
  }
};

class TagNav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      attachedBodyListener: false,
      isEditing: false,
      selectedTag: null
    };
  }

  suggestions = [{}]

  handleNewTagSave = (tag) => {
  }

  handleNewTagUpdate = (tag) => {
  }

  handleTagSave = (tag) => {
  }

  handleTagRemove = (tag) => {
  }

  handleTagUpdate = (tag) => {
  }

  handleMoveTag = (dragIndex, hoverIndex) => {
  }

  handleGetSuggestions = (suggestionUpdateRequest) => {
  }

  handleClearSuggestions = () => {
  }

  handleTagMouseOver = () => {
    console.log({ text:"hover" });
  }

  handleEditButtonClick = () => {
  }

  hasDropdownClassName(tag) {
    if (_.isArray(tag.relatedTagIds)) {
      return "has-dropdown";
    }
    return null;
  }

  navbarSelectedClassName = () => {}

  renderEditButton() {
    // if (this.showEditControls) {
    if (true) {
      return (
        <span className="edit-container-item" style={styles.editContainerItem}>
          <EditButton
            onClick={this.handleEditButtonClick}
            status={"status"}
            tooltip={"tooltip"}
          />
        </span>
      );
    }

    return null;
  }
/*
  <div class="rui tagnav {{navbarOrientation}} {{navbarPosition}} {{navbarAnchor}} {{navbarVisibility}}">
    <div class="navbar-header">
      {{> button
        icon="times"
        className="close-button"
        status="default"
        onClick=handleMenuClose
      }}
      {{> coreNavigationBrand}}
    </div>
    <div class="navbar-items">
      {{#each tag in tags}}
        <div class="navbar-item {{navbarSelectedClassName tag}} {{hasDropdownClassName tag}}" data-id={{tag._id}}>
          {{> tagItem (tagProps tag)}}

          <div class="dropdown-container" data-tag={{tag._id}}>
            {{> tagTree (tagTreeProps tag)}}
          </div>
        </div>
      {{/each}}
      {{#if isEditing}}
        <div class="navbar-item create">
          {{> tagItem blankTagProps}}
        </div>
      {{/if}}

      {{#if canEdit}}
        <div class="navbar-item edit-button">
          {{> React EditButton }}
        </div>
      {{/if}}
    </div>
  </div>
*/

  renderTags() {
    if (_.isArray(this.props.tags)) {
      const tags = this.props.tags.map((tag, index) => {
        const classAttr = `navbar-item ${this.navbarSelectedClassName(tag)} ${this.hasDropdownClassName(tag)} data-id=${tag._id}`;
        return (
          <DragDropProvider key={tag._id}>
            <div className={classAttr}>
              <TagItem
                data-id={tag._id}
                editable={this.props.editable}
                index={index}
                key={index}
                onClearSuggestions={this.handleClearSuggestions}
                onGetSuggestions={this.handleGetSuggestions}
                onMove={this.handleMoveTag}
                onTagInputBlur={this.handleTagSave}
                onTagMouseOut={this.handleTagMouseOut}
                onTagMouseOver={this.handleTagMouseOver}
                onTagRemove={this.handleTagRemove}
                onTagSave={this.handleTagSave}
                onTagUpdate={this.handleTagUpdate}
                suggestions={this.suggestions}
                tag={tag}
              />
              <div className={`dropdown-container data-tag=${tag._id}`}>
                <TagTree />
              </div>
            </div>
          </DragDropProvider>
        );
      });

      // Render an blank tag for creating new tags
      if (this.props.editable) {
        tags.push(
          <div />
        );
      }

      return tags;
    }

    return null;
  }

  render() {
    return (
      <div className="rui tagnav horizontal static inline closed">
        <div className="navbar-header">
          <p>Header</p>
        </div>
        <div className="navbar-items">
          {this.renderTags()}
          {this.renderEditButton()}
        </div>
      </div>
    );
  }
}

TagNav.propTypes = {
  editButton: PropTypes.node,
  editable: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.object)
};

export default TagNav;
