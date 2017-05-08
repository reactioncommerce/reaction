import React, { Component, PropTypes } from "react";
import { TagList } from "/imports/plugins/core/ui/client/components/tags/";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";

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

  render() {
    return (
      <div className="rui tagnav {{navbarOrientation}} {{navbarPosition}} {{navbarAnchor}} {{navbarVisibility}}">
        <div className="navbar-header">
          <p>Heaad</p>
        </div>
        <div className="navbar-items">
        <DragDropProvider>
          <TagList
            newTag={this.state.newTag}
            onClick={this.handleEditButtonClick}
            onClearSuggestions={this.handleClearSuggestions}
            onGetSuggestions={this.handleGetSuggestions}
            onMoveTag={this.handleMoveTag}
            onNewTagSave={this.handleNewTagSave}
            onNewTagUpdate={this.handleNewTagUpdate}
            onTagRemove={this.handleTagRemove}
            onTagSave={this.handleTagSave}
            onTagUpdate={this.handleTagUpdate}
            suggestions={this.suggestions}
            tags={this.props.tags}
            tooltip="Unpublished changes"
            {...this.props}
          />
      </DragDropProvider>

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
