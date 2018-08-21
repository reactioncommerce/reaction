import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction, Router } from "/client/api";
import withTags from "/imports/plugins/core/graphql/lib/hocs/withTags";
import withShopId from "/imports/plugins/core/graphql/lib/hocs/withShopId";
import TagNavCustomer from "../components/tagNavCustomer";
import { getSlug } from "/lib/api";

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
  isMobile() {
    return window.matchMedia("(max-width: 991px)").matches;
  },
  tagById(tagId, tags) {
    return _.find(tags, (tag) => tag._id === tagId);
  },
  hasSubTags(tagId, tags) {
    const foundTag = this.tagById(tagId, tags);

    if (foundTag) {
      if (foundTag.subTags && Array.isArray(foundTag.subTags.nodes) && foundTag.subTags.nodes.length > 0) {
        return true;
      }
    }
    return false;
  },
  hasSubTagsForOne(tag) {
    return tag && tag.subTags && Array.isArray(tag.subTags.nodes) && tag.subTags.nodes.length > 0;
  }
};

const wrapComponent = (Comp) => (
  class TagNavCustomerContainer extends Component {
    static propTypes = {
      closeNavbar: PropTypes.func,
      isVisible: PropTypes.bool,
      tagIds: PropTypes.arrayOf(PropTypes.string),
      tags: PropTypes.arrayOf(PropTypes.object),
      tagsByKey: PropTypes.object
    }

    constructor(props) {
      super(props);

      this._isMounted = false;

      this.state = {
        attachedBodyListener: false,
        tagIds: props.tagIds || [],
        tagsByKey: props.tagsByKey || {},
        selectedTag: null,
        [NavbarStates.Visible]: props.isVisible
      };

      this.onWindowResize = this.onWindowResize.bind(this);
    }

    componentDidMount() {
      window.addEventListener("resize", this.onWindowResize);
      this.onWindowResize();
      this._isMounted = true;
    }

    componentWillReceiveProps(nextProps) {
      let selectedTag = {};
      const { tags = [] } = nextProps;
      tags.forEach((tag) => {
        if (this.isSelected(tag)) {
          selectedTag = tag;
        }
      });

      const { tagIds = [], tagsByKey = {}, isVisible } = nextProps;
      this.setState({
        [NavbarStates.Visible]: isVisible,
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

    attachBodyListener = () => {
      document.body.addEventListener("mouseover", this.closeDropdown);
      this.setState({ attachedBodyListener: true });
    }

    detachhBodyListener = () => {
      document.body.removeEventListener("mouseover", this.closeDropdown);
      this.setState({ attachedBodyListener: false });
    }

    closeDropdown = (event) => {
      const closestNavItem = event.target.closest(".navbar-item");

      // on mouseover an element outside of tags, close dropdown
      if (this._isMounted && !closestNavItem) {
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
      const { tags } = this.props;

      if (TagNavHelpers.isMobile()) {
        return;
      }
      // User mode
      if (TagNavHelpers.hasSubTagsForOne(tag)) {
        // Otherwise, show the menu
        // And Attach an event listener to the document body
        // This will check to see if the dropdown should be closed if the user
        // leaves the tag nav bar
        this.attachBodyListener();
        this.setState({ selectedTag: TagNavHelpers.tagById(tagId, tags) });
        return;
      }
      // Don't show dropdown if there are no subtags
      this.setState({ selectedTag: null });
      return;
    }

    handleTagClick = (event, tag) => {
      if (TagNavHelpers.isMobile()) {
        const tagId = tag._id;
        const { tags } = this.props;
        const { selectedTag } = this.state;
        const hasSubTags = TagNavHelpers.hasSubTagsForOne(tag);

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

    hasDropdownClassName(tag) {
      if (TagNavHelpers.hasSubTagsForOne(tag)) {
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
            tags={this.props.tags}
            selectedTag={this.state.selectedTag}
            navButtonStyles={navButtonStyles}
            hasDropdownClassName={this.hasDropdownClassName}
            navbarSelectedClassName={this.navbarSelectedClassName}
            onTagClick={this.handleTagClick}
            onTagMouseOver={this.handleTagMouseOver}
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
  onData(null, {
    name: "coreHeaderNavigation",
    isVisible: props.isVisible,
    shopSlug: getSlug(Reaction.getShopName().toLowerCase())
  });
};

registerComponent("TagNavCustomer", TagNavCustomer, [
  composeWithTracker(composer),
  withShopId,
  withTags,
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  withShopId,
  withTags,
  wrapComponent
)(TagNavCustomer);
