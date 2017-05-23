import debounce from "lodash/debounce";
import update from "react/lib/update";
import React, { Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import { getTagIds } from "/lib/selectors/tags";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import { Tags } from "/lib/collections";
import TagNav from "../components/tagNav";

const navButtonStyles = {
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
  onUpdateTag(tagId, tagName, parentTagId) {
    TagHelpers.updateTag(tagId, tagName, parentTagId);
  },
  isMobile() {
    return window.matchMedia("(max-width: 991px)").matches;
  },
  tagById(tagId, tags) {
    return _.find(tags, (tag) => tag._id === tagId);
  },
  updateSuggestions(suggestion, excludeTagsObj) {
    return TagHelpers.updateSuggestions(suggestion, excludeTagsObj);
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

class TagNavContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      attachedBodyListener: false,
      editable: false,
      tagIds: props.tagIds || [],
      tagsByKey: props.tagsByKey || {},
      selectedTag: null,
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

  componentWillReceiveProps(nextProps) {
    const { tagIds, tagsByKey } = nextProps;
    this.setState({ tagIds, tagsByKey });
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
    TagNavHelpers.onTagCreate(tag.name, parentTag);
    this.setState({ newTag: { name: "" } });
  }

  handleNewTagUpdate = (tag) => { // updates the current tag state being edited
    this.setState({
      newTag: tag
    });
  }

  handleTagRemove = (tag, parentTag) => {
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
    TagNavHelpers.onUpdateTag(tag._id, tag.name);
  }

  handleMoveTag = (dragIndex, hoverIndex) => {
    const tag = this.state.tagIds[dragIndex];

    // Apply new sort order to variant list
    const newState = update(this.state, {
      tagIds: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, tag]
        ]
      }
    });

    // Set local state so the component does't have to wait for a round-trip
    // to the server to get the updated list of variants
    this.setState(newState, () => {
      debounce(() => TagNavHelpers.onTagSort(this.state.tagIds), 500)(); // Save the updated positions
    });
  }

  handleGetSuggestions = (suggestionUpdateRequest) => {
    const suggestions = TagNavHelpers.updateSuggestions(
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
    if (_.isEqual(currentSelectedTag, this.state.selectedTag)) {
      this.setState({ selectedTag: null });
    } else {
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
      <TagNav
        {...TagNavHelpers}
        navbarOrientation={this.navbarOrientation}
        navbarPosition={this.navbarPosition}
        navbarAnchor={this.navbarAnchor}
        navbarVisibility={this.navbarVisibility}
        tags={this.tags}
        isTagNav={true}
        canEdit={this.canEdit}
        newTag={this.state.newTag}
        navButtonStyles={navButtonStyles}
        enableNewTagForm={true}
        editable={this.state.editable}
        hasDropdownClassName={this.hasDropdownClassName}
        navbarSelectedClassName={this.navbarSelectedClassName}
        suggestions={this.state.suggestions}
        onClearSuggestions={this.handleClearSuggestions}
        onGetSuggestions={this.handleGetSuggestions}
        onEditButtonClick={this.handleEditButtonClick}
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
    );
  }
}

TagNavContainer.propTypes = {
  editButton: PropTypes.node,
  editable: PropTypes.bool,
  hasEditRights: PropTypes.bool,
  tagIds: PropTypes.arrayOf(PropTypes.string),
  tagsAsArray: PropTypes.arrayOf(PropTypes.object),
  tagsByKey: PropTypes.object
};

const composer = (props, onData) => {
  let tags = Tags.find({ isTopLevel: true }, { sort: { position: 1 } }).fetch();
  tags = _.sortBy(tags, "position"); // puts tags without position at end of array

  const tagsByKey = {};

  if (Array.isArray(tags)) {
    for (const tag of tags) {
      tagsByKey[tag._id] = tag;
    }
  }

  onData(null, {
    name: "coreHeaderNavigation",
    hasEditRights: Reaction.hasAdminAccess(),
    tagsAsArray: tags,
    tagIds: getTagIds({ tags }),
    tagsByKey
  });
};

export default composeWithTracker(composer, null)(TagNavContainer);
