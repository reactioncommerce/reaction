import _ from "lodash";
import update from "immutability-helper";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction, Router } from "/client/api";
import { getTagIds } from "/lib/selectors/tags";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import getTagSuggestions from "/imports/plugins/core/ui-tagnav/client/util/getTagSuggestions";
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

const wrapComponent = (Comp) => (
  class TagNavContainer extends Component {
    static propTypes = {
      closeNavbar: PropTypes.func,
      editButton: PropTypes.node,
      editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
      hasEditRights: PropTypes.bool,
      isVisible: PropTypes.bool,
      tagIds: PropTypes.arrayOf(PropTypes.string),
      tagsAsArray: PropTypes.arrayOf(PropTypes.object),
      tagsByKey: PropTypes.object
    }

    constructor(props) {
      super(props);

      this._isMounted = false;

      this.state = {
        attachedBodyListener: false,
        editable: false,
        tagIds: props.tagIds || [],
        tagsByKey: props.tagsByKey || {},
        selectedTag: null,
        suggestions: [],
        [NavbarStates.Visible]: props.isVisible,
        newTag: {
          name: ""
        }
      };

      this.onWindowResize = this.onWindowResize.bind(this);
    }

    componentDidMount() {
      window.addEventListener("resize", this.onWindowResize);
      this.onWindowResize();
      this._isMounted = true;
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps(nextProps) {
      let selectedTag = {};
      const previousEdit = this.state.editable;
      nextProps.tagsAsArray.forEach((tag) => {
        if (this.isSelected(tag)) {
          selectedTag = tag;
        }
      });

      const { tagIds, tagsByKey, isVisible } = nextProps;
      this.setState({
        [NavbarStates.Visible]: isVisible,
        editable: previousEdit && this.canEdit,
        tagIds,
        tagsByKey,
        selectedTag
      });
    }

    componentWillUnmount() {
      window.removeEventListener("resize", this.onWindowResize);
      this._isMounted = false;
    }

    onWindowResize = () => {
      const matchQuery = window.matchMedia("(max-width: 991px)");
      if (matchQuery.matches) {
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

    canSaveTag(tag) {
      // Blank tags cannot be saved
      if (typeof tag.name === "string" && tag.name.trim().length === 0) {
        return false;
      }

      // If the tag does not have an id, then allow the save
      if (!tag._id) {
        return true;
      }

      // Get the original tag from the props
      // Tags from props are not mutated, and come from an outside source
      const originalTag = this.props.tagsByKey[tag._id];

      if (originalTag && originalTag.name !== tag.name) {
        return true;
      }

      return false;
    }

    handleNewTagSave = (tag, parentTag) => {
      if (this.canSaveTag(tag)) {
        TagNavHelpers.onTagCreate(tag.name, parentTag);
        this.setState({ newTag: { name: "" } });
      }
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
        _.debounce(() => TagNavHelpers.onTagSort(this.state.tagIds), 500)(); // Save the updated positions
      });
    }

    handleGetSuggestions = async (suggestionUpdateRequest) => {
      const suggestions = await getTagSuggestions(
        suggestionUpdateRequest.value,
        { excludeTags: this.state.tagIds }
      );

      this.setState({ suggestions });
    }

    handleClearSuggestions = () => {
      this.setState({ suggestions: [] });
    }

    get canEdit() {
      return this.props.hasEditRights;
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
      const closestNavigationItem = event.target.closest(".navbar-item");

      // on mouseover an element outside of tags, close dropdown
      if (this._isMounted && !closestNavigationItem) {
        this.closeDropdownTimeout = setTimeout(() => {
          this.setState({ selectedTag: null });
          this.detachhBodyListener();
        }, 500);
      } else if (this.closeDropdownTimeout) {
        clearTimeout(this.closeDropdownTimeout);
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

    handleTagClick = (event, tag) => {
      if (TagNavHelpers.isMobile()) {
        const tagId = tag._id;
        const tags = this.props.tagsAsArray;
        const { selectedTag } = this.state;
        const hasSubTags = TagNavHelpers.hasSubTags(tagId, tags);

        if (hasSubTags === false) {
          // click close button to make navbar left disappear
          this.props.closeNavbar();
          Router.go("tag", { slug: tag.slug });
        } else {
          event.preventDefault();
        }

        if (selectedTag && selectedTag._id === tagId) {
          this.setState({ selectedTag: null });
        } else if (hasSubTags) {
          this.setState({ selectedTag: TagNavHelpers.tagById(tagId, tags) });
        }
      } else {
        Router.go("tag", { slug: tag.slug });
      }
    }

    handleEditButtonClick = () => {
      this.setState({ editable: !this.state.editable });
    }

    hasDropdownClassName(tag) {
      if (Array.isArray(tag.relatedTagIds)) {
        return "has-dropdown";
      }
      return "";
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
        <div>
          <Comp
            {...this.props}
            {...TagNavHelpers}
            navbarOrientation={this.navbarOrientation}
            navbarPosition={this.navbarPosition}
            navbarAnchor={this.navbarAnchor}
            navbarVisibility={this.navbarVisibility}
            tags={this.tags}
            canEdit={this.canEdit}
            newTag={this.state.newTag}
            selectedTag={this.state.selectedTag}
            navButtonStyles={navButtonStyles}
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
            onTagClick={this.handleTagClick}
            onTagMouseOver={this.handleTagMouseOver}
            onTagRemove={this.handleTagRemove}
            onTagSave={this.handleTagSave}
            onTagUpdate={this.handleTagUpdate}
            onTagSelect={this.onTagSelect}
          />
          <Components.Overlay
            isVisible={this.state[NavbarStates.Visible]}
            onClick={this.props.closeNavbar}
          />
        </div>
      );
    }
  }
);

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
    isVisible: props.isVisible,
    tagIds: getTagIds({ tags }),
    tagsByKey
  });
};

registerComponent("TagNav", TagNav, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(TagNav);
