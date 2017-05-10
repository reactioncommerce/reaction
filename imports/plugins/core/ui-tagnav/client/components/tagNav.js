import React, { Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";
import { EditButton } from "/imports/plugins/core/ui/client/components";
import TagTree from "./tagTree";

const styles = {
  editContainerItem: {
    display: "flex",
    marginLeft: 5
  }
};

const NavbarStates = {
  Orientation: "stateNavbarOrientation",
  Position: "stateNavbarPosition",
  Anchor: "stateNavbarAnchor",
  Visible: "stateNavbarVisible"
};

const NavbarOrientation = {
  Vertical: "vertical",
  Horizontal: "horizontal"
};

const NavbarVisibility = {
  Shown: "shown",
  Hidden: "hidden"
};

const NavbarPosition = {
  Static: "static",
  Fixed: "fixed"
};

const NavbarAnchor = {
  Top: "top",
  Right: "right",
  Bottom: "bottom",
  Left: "left",
  None: "inline"
};

const TagNavHelpers = {
  onTagCreate(tagName, parentTag) {
    TagHelpers.createTag(tagName, undefined, parentTag);
  },
  onTagRemove(tag, parentTag) {
    TagHelpers.removeTag(tag, parentTag);
  },
  onTagSort(tagIds, parentTag) {
    TagHelpers.sortTags(tagIds, parentTag);
  },
  onTagDragAdd(movedTagId, toListId, toIndex, ofList) {
    TagHelpers.moveTagToNewParent(movedTagId, toListId, toIndex, ofList);
  },
  onTagUpdate(tagId, tagName) {
    TagHelpers.updateTag(tagId, tagName);
  },
  isMobile() {
    return window.matchMedia("(max-width: 991px)").matches;
  },
  tagById(tagId, tags) {
    return _.find(tags, (tag) => tag._id === tagId);
  },
  hasSubTags(tagId, tags) {
    const foundTag = this.tagById(tagId, tags);

    if (foundTag) {
      if (_.isArray(foundTag.relatedTagIds) && foundTag.relatedTagIds.length) {
        return true;
      }
    }
    return false;
  }
};

class TagNav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      attachedBodyListener: false,
      editable: false,
      selectedTag: null,
      [NavbarStates.Visible]: false,
      [NavbarStates.Visibile]: NavbarVisibility.Hidden
    };
  }

  componentDidMount() {
    $(window).on("resize", this.onWindowResize).trigger("resize");
  }

  newTag = {
    name: ""
  }

  suggestions = [{}]

  onWindowResize = () => {
    if (window.matchMedia("(max-width: 991px)").matches) {
      this.setState({ [NavbarStates.Orientation]: NavbarOrientation.Vertical });
      this.setState({ [NavbarStates.Position]: NavbarPosition.Fixed });
      this.setState({ [NavbarStates.Anchor]: NavbarAnchor.Left });
    } else {
      this.setState({ [NavbarStates.Orientation]: NavbarOrientation.Horizontal });
      this.setState({ [NavbarStates.Position]: NavbarPosition.Static });
      this.setState({ [NavbarStates.Anchor]: NavbarAnchor.None });
      this.setState({ [NavbarStates.Visible]: false });
    }
  }

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

  get canEdit() {
    return this.props.hasEdits && Reaction.isPreview() === false;
  }

  attachBodyListener = () => {
    document.body.addEventListener("mouseover", this.closeDropdown);
    this.setState({ attachedBodyListener: true });
  }

  detachhBodyListener = () => {
    document.body.removeEventListener("mouseover", this.closeDropdown);
    this.setState({ attachedBodyListener: false });
  }

  closeDropdown = (event) => {
    if ($(event.target).closest(".navbar-item").length === 0) {
      this.closeDropdownTimeout = setTimeout(() => {
        this.setState({ selectedTag: null });
        this.detachhBodyListener();
      }, 500);
    } else {
      if (this.closeDropdownTimeout) {
        clearTimeout(this.closeDropdownTimeout);
      }
    }
  }

  get navbarOrientation() {
    return this.state[NavbarStates.Orientation];
  }

  get navbarPosition() {
    return this.state[NavbarStates.Position];
  }

  get navbarAnchor() {
    return this.state[NavbarStates.Anchor];
  }

  get navbarVisibility() {
    const isVisible = this.state[NavbarStates.Visible] === true;

    if (isVisible) {
      return "open";
    }
    return "closed";
  }

  onTagSelect = (selectedTag) => {
    console.log({ selectedTag });
    if (JSON.stringify(selectedTag) === JSON.stringify(this.state.selectedTag)) {
      this.setState({ selectedTag: null });
    } else {
      this.setState({ selectedTag: selectedTag });
    }
  }

  isSelected(tag) {
    let isSelected = false;
    if (this.state.selectedTag && tag) {
      isSelected = this.state.selectedTag._id === tag._id;
    }
    return isSelected;
  }

  handleTagMouseOver = (event, tag) => {
    const tagId = tag._id;
    const tags = this.props.tags;

    if (TagNavHelpers.isMobile()) {
      return;
    }
    // While in edit mode, don't trigger the hover hide/show menu
    if (this.state.editable === false) {
      // User mode
      // Don't show dropdown if there are no subtags
      if (TagNavHelpers.hasSubTags(tagId, tags) === false) {
        this.setState({ selectedTag: null });
        return;
      }

      // Otherwise, show the menu
      // And Attach an event listener to the document body
      // This will check to see if the dropdown should be closed if the user
      // leaves the tag nav bar
      this.attachBodyListener();
      this.setState({ selectedTag: TagNavHelpers.tagById(tagId, tags) });
    }
  }

  handleEditButtonClick = () => {
    this.setState({ editable: !this.state.editable });
  }

  hasDropdownClassName(tag) {
    if (_.isArray(tag.relatedTagIds)) {
      return "has-dropdown";
    }
    return null;
  }

  navbarSelectedClassName = (tag) => {
    const selectedTag = this.state.selectedTag;

    if (selectedTag) {
      if (selectedTag._id === tag._id) {
        return "selected";
      }
    }
    return "";
  }

  renderEditButton() {
    if (this.canEdit) {
      return (
        <span className="navbar-item edit-button" style={styles.editContainerItem}>
          <EditButton
            onClick={this.handleEditButtonClick}
            bezelStyle="solid"
            primary={true}
            icon="fa fa-pencil"
            onIcon="fa fa-check"
            toggle={true}
            toggleOn={this.state.editable}
          />
        </span>
      );
    }

    return null;
  }

  renderTags() {
    if (_.isArray(this.props.tags)) {
      const tags = this.props.tags.map((tag, index) => {
        const classAttr = `navbar-item ${this.navbarSelectedClassName(tag)} ${this.hasDropdownClassName(tag)} data-id=${tag._id}`;
        return (
          <DragDropProvider key={index}>
            <div className={classAttr}>
              <TagItem
                className="js-tagNav-item"
                data-id={tag._id}
                editable={this.state.editable}
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
                onTagSave={TagNavHelpers.onTagCreate}
                onTagSelect={this.onTagSelect}
                selectable={true}
                onTagUpdate={this.handleTagUpdate}
                suggestions={this.suggestions}
                tag={tag}
              />
              <div className={`dropdown-container data-tag=${tag._id}`}>
                <TagTree
                  editable={this.state.editable === true}
                  onTagRemove={this.handleTagRemove}
                  parentTag={tag}
                  subTagGroups={TagHelpers.subTags(tag)}
                  {...TagNavHelpers}
                />
              </div>
            </div>
          </DragDropProvider>
        );
      });

      // Render an blank tag for creating new tags
      if (this.state.editable) {
        tags.push(
          <DragDropProvider key={"newTag"}>
            <div className="navbar-item">
              <TagItem
                blank={true}
                key="newTagForm"
                onClearSuggestions={this.handleClearSuggestions}
                onGetSuggestions={this.handleGetSuggestions}
                onTagInputBlur={this.handleNewTagSave}
                onTagSave={TagNavHelpers.onTagCreate}
                onTagUpdate={this.handleNewTagUpdate}
                tag={this.newTag}
                suggestions={this.suggestions}
              />
            </div>
          </DragDropProvider>
        );
      }

      return tags;
    }

    return null;
  }

  render() {
    return (
      <div className={`rui tagnav ${this.navbarOrientation} ${this.navbarPosition} ${this.navbarAnchor} ${this.navbarVisibility}`}>
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
  hasEdits: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.object)
};

export default TagNav;
