import { Reaction } from "/client/api";
import React, { Component, PropTypes } from "react";
import { Tags } from "/lib/collections";
import classnames from "classnames";
import { EditButton } from "/imports/plugins/core/ui/client/components";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";
import { TagList } from "/imports/plugins/core/ui/client/components/tags/";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import update from "react/lib/update";
// import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";


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

class TagNav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      attachedBodyListener: false,
      editable: false,
      tagIds: props.tagIds || [],
      tagsByKey: props.tagsByKey || {},
      selectedTag: null,
      suggestions: [],
      tags: props.tags,
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

  handleNewTagSave = () => {
    console.log('handleNewTagSave');
  }

  // handleNewTagUpdate = (event, newTag) => {
  //   console.log('handleNewTagUpdate');
  //   TagNavHelpers.onTagCreate(newTag.name, []);
  // }

  handleNewTagUpdate = (tag) => {
    this.setState({
      newTag: tag
    });
  }

  onTagSave = (event, tag) => { // on enter key press
    TagNavHelpers.onTagCreate(tag.name);
  }

  handleTagRemove = () => {
  }

  handleTagUpdate = (event, tag) => {
    console.log({ state: this.state });

    const newState = update(this.state, {
      tagsByKey: {
        [tag._id]: {
          $set: tag
        }
      }
    });

    console.log({ newState });
    this.setState(newState);
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

  onTagSelect = (selectedTag) => {
    console.log('selectedTag');
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

  get tags() {
    if (this.props.editable) {
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
        <div className="navbar-items">
          <DragDropProvider>
            <TagList
              newTag={this.state.newTag}
              onClick={this.handleEditButtonClick}
              onClearSuggestions={this.handleClearSuggestions}
              onGetSuggestions={this.handleGetSuggestions}
              onMoveTag={this.handleMoveTag}
              editable={this.state.editable}
              onNewTagSave={this.handleNewTagSave}
              onNewTagUpdate={this.handleNewTagUpdate}
              onTagRemove={this.handleTagRemove}
              onTagSave={this.handleTagSave}
              onTagUpdate={this.handleTagUpdate}
              suggestions={this.state.suggestions}
              tags={this.tags}
              tooltip="Unpublished changes"
              {...this.props}
            />
          </DragDropProvider>
        </div>
        {this.renderEditButton()}
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
