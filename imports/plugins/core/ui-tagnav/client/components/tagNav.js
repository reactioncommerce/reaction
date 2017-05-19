import { Reaction } from "/client/api";
import React, { Component, PropTypes } from "react";
import { Tags } from "/lib/collections";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";
import { TagList } from "/imports/plugins/core/ui/client/components/tags/";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import update from "react/lib/update";


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
      if (Array.isArray(foundTag.relatedTagIds) && foundTag.relatedTagIds.length) {
        return true;
      }
    }
    return false;
  }
};

let editable = false;
let selectedTag = null;

class TagNav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      attachedBodyListener: false,
      editable: editable,
      tagIds: props.tagIds || [],
      tagsByKey: props.tagsByKey || {},
      selectedTag: selectedTag,
      suggestions: [],
      [NavbarStates.Visible]: false,
      [NavbarStates.Visibile]: NavbarVisibility.Hidden,
      newTag: {
        name: ""
      }
    };
  }

  componentDidMount() {
    $(window).on("resize", this.onWindowResize).trigger("resize");
  }

  componentWillUnmount() {
    $(window).off("resize", this.onWindowResize);
  }

  onWindowResize = () => {
    if (window.matchMedia("(max-width: 991px)").matches) {
      this.setState({
        [NavbarStates.Orientation]: NavbarOrientation.Vertical,
        [NavbarStates.Position]: NavbarPosition.Fixed,
        [NavbarStates.Anchor]: NavbarAnchor.Left
      });
    } else {
      this.setState({
        [NavbarStates.Orientation]: NavbarOrientation.Horizontal,
        [NavbarStates.Position]: NavbarPosition.Static,
        [NavbarStates.Anchor]: NavbarAnchor.None,
        [NavbarStates.Visible]: false
      });
    }
  }

  handleNewTagSave = (tag, parentTag) => {
    editable = true; // keep editing state after re-render
    TagNavHelpers.onTagCreate(tag.name, parentTag);
  }

  handleNewTagUpdate = (tag) => { // updates the current tag state being edited
    this.setState({
      newTag: tag
    });
  }

  handleTagRemove = (tag, parentTag) => {
    editable = true; // keep editing state after re-render
    TagNavHelpers.onTagRemove(tag, parentTag);
  }

  handleTagUpdate = (tag) => {
    const newState = update(this.state, {
      tagsByKey: {
        [tag._id]: {
          $set: tag
        }
      }
    });

    this.setState(newState);
  }

  handleTagSave = (tag) => {
    TagNavHelpers.onTagUpdate(tag._id, tag.name);
  }

  handleMoveTag = () => {
  }

  handleGetSuggestions = (suggestionUpdateRequest) => {
    const suggestions = updateSuggestions(
      suggestionUpdateRequest.value,
      { excludeTags: this.state.tagIds }
    );

    this.setState({ suggestions });
  }

  handleClearSuggestions = () => {
    this.setState({ suggestions: [] });
  }

  get canEdit() {
    return this.props.hasEditRights && Reaction.isPreview() === false;
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

  onTagSelect = (currentSelectedTag) => {
    if (JSON.stringify(currentSelectedTag) === JSON.stringify(selectedTag)) {
      selectedTag = null; // to keep open state on re-rendering
      this.setState({ selectedTag: null });
    } else {
      selectedTag = currentSelectedTag; // to keep open state on re-rendering
      this.setState({ selectedTag: currentSelectedTag });
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
    const tags = this.props.tagsAsArray;

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
    if (Array.isArray(tag.relatedTagIds)) {
      return "has-dropdown";
    }
    return null;
  }

  navbarSelectedClassName = (tag) => {
    const currentSelectedTag = this.state.selectedTag;

    if (currentSelectedTag) {
      if (currentSelectedTag._id === tag._id) {
        return "selected";
      }
    }
    return "";
  }

  get tags() {
    if (this.state.editable) {
      return this.state.tagIds.map((tagId) => this.state.tagsByKey[tagId]);
    }

    return this.props.tagsAsArray;
  }

  render() {
    return (
      <div className={`rui tagnav ${this.navbarOrientation} ${this.navbarPosition} ${this.navbarAnchor} ${this.navbarVisibility}`}>
        <div className="navbar-header">
          <p>Header</p>
        </div>
        <DragDropProvider>
          <TagList
            {...TagNavHelpers}
            {...this.props}
            isTagNav={true}
            canEdit={this.canEdit}
            newTag={this.state.newTag}
            navButton={styles}
            handleEditButtonClick={this.handleEditButtonClick}
            editable={this.state.editable}
            suggestions={this.state.suggestions}
            tags={this.tags}
            enableNewTagForm={true}
            hasDropdownClassName={this.hasDropdownClassName}
            navbarSelectedClassName={this.navbarSelectedClassName}
            onClearSuggestions={this.handleClearSuggestions}
            onGetSuggestions={this.handleGetSuggestions}
            onMoveTag={this.handleMoveTag}
            onNewTagSave={this.handleNewTagSave}
            onNewTagUpdate={this.handleNewTagUpdate}
            onTagMouseOut={this.handleTagMouseOut}
            onTagMouseOver={this.handleTagMouseOver}
            onTagRemove={this.handleTagRemove}
            onTagSave={this.handleTagSave}
            onTagUpdate={this.handleTagUpdate}
            onTagSelect={this.onTagSelect}
          />
        </DragDropProvider>
      </div>
    );
  }
}

TagNav.propTypes = {
  editButton: PropTypes.node,
  editable: PropTypes.bool,
  hasEditRights: PropTypes.bool,
  tagIds: PropTypes.arrayOf(PropTypes.string),
  tagsAsArray: PropTypes.arrayOf(PropTypes.object),
  tagsByKey: PropTypes.object
};

export default TagNav;

// TODO: should be shared
function updateSuggestions(term, { excludeTags }) {
  const slug = Reaction.getSlug(term);

  const selector = {
    slug: new RegExp(slug, "i")
  };

  if (Array.isArray(excludeTags)) {
    selector._id = {
      $nin: excludeTags
    };
  }

  const tags = Tags.find(selector).map((tag) => {
    return {
      label: tag.name
    };
  });

  return tags;
}
