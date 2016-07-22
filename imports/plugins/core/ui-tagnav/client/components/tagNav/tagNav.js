import Sortable from "sortablejs";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

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

Template.tagNav.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    attachedBodyListener: false,
    isEditing: false,
    selectedTag: null,
    [NavbarStates.Visible]: false
  });

  this.autorun(() => {
    const isEditing = Session.equals("reaction/editModeEnabled", true);

    // Update local state from global session state
    this.state.set("isEditing", isEditing);
  });

  this.moveItem = (array, fromIndex, toIndex) => {
    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);
    return array;
  };

  this.toggleNavbarVisibility = () => {
    const isVisible = this.state.get(NavbarStates.Visible);
    this.state.set(NavbarStates.Visible, !isVisible);
  };

  this.data.onToggleMenu(this.toggleNavbarVisibility);

  if (this.data.name) {
    document.body.addEventListener(`${this.data.name}_toggleMenuVisibility`, this.toggleNavbarVisibility);
  }

  this.attachBodyListener = () => {
    document.body.addEventListener("mouseover", this.closeDropdown);
    this.state.set("attachedBodyListener", true);
  };

  this.detachhBodyListener = () => {
    document.body.removeEventListener("mouseover", this.closeDropdown);
    this.state.set("attachedBodyListener", false);
  };

  this.closeDropdown = (event) => {
    if ($(event.target).closest(".navbar-item").length === 0) {
      this.closeDropdownTimeout = setTimeout(() => {
        this.state.set("selectedTag", null);
        this.detachhBodyListener();
      }, 500);
    } else {
      if (this.closeDropdownTimeout) {
        clearTimeout(this.closeDropdownTimeout);
      }
    }
  };

  this.state.set(NavbarStates.Visibility, NavbarVisibility.Hidden);


  this.onWindowResize = () => {
    if (window.matchMedia("(max-width: 991px)").matches) {
      this.state.set(NavbarStates.Orientation, NavbarOrientation.Vertical);
      this.state.set(NavbarStates.Position, NavbarPosition.Fixed);
      this.state.set(NavbarStates.Anchor, NavbarAnchor.Left);
    } else {
      this.state.set(NavbarStates.Orientation, NavbarOrientation.Horizontal);
      this.state.set(NavbarStates.Position, NavbarPosition.Static);
      this.state.set(NavbarStates.Anchor, NavbarAnchor.None);
    }
  };
});

Template.tagNav.onRendered(() => {
  const instance = Template.instance();
  const list = instance.$(".navbar-items")[0];

  $(window).on("resize", instance.onWindowResize).trigger("resize");

  instance._sortable = Sortable.create(list, {
    group: "tags",
    handle: ".js-tagNav-item",
    onSort(event) {
      let tagIds = instance.data.tags.map(item => {
        if (item) {
          return item._id;
        }
      });

      let newTagsOrder = instance.moveItem(tagIds, event.oldIndex, event.newIndex);

      if (newTagsOrder) {
        TagNavHelpers.onTagSort(newTagsOrder, instance.data.parentTag);
      }
    },

    // On add from another list
    onAdd(event) {
      const toListId = event.to.dataset.id;
      const movedTagId = event.item.dataset.id;
      let tagIds = instance.data.tags.map(item => {
        if (item) {
          return item._id;
        }
      });

      TagNavHelpers.onTagDragAdd(movedTagId, toListId, event.newIndex, tagIds);
    },

    // Tag removed from list becuase it was dragged to a different list
    onRemove(event) {
      const movedTagId = event.item.dataset.id;
      let foundTag = _.find(instance.data.tags, (tag) => {
        return tag._id === movedTagId;
      });

      TagNavHelpers.onTagRemove(foundTag, instance.data.parentTag);
    }
  });
});

Template.tagNav.onDestroyed(function () {
  // $(window).off("resize", this.onWindowResize);
});


Template.tagNav.helpers({

  navbarOrientation() {
    return Template.instance().state.get(NavbarStates.Orientation);
  },

  navbarPosition() {
    return Template.instance().state.get(NavbarStates.Position);
  },

  navbarAnchor() {
    return Template.instance().state.get(NavbarStates.Anchor);
  },

  navbarVisibility() {
    const isVisible = Template.instance().state.equals(NavbarStates.Visible, true);

    if (isVisible) {
      return "open";
    }
    return "closed";
  },

  navbarSelectedClassName(tag) {
    const selectedTag = Template.instance().state.get("selectedTag");

    if (selectedTag) {
      if (selectedTag._id === tag._id) {
        return "selected";
      }
    }
    return "";
  },

  hasDropdownClassName(tag) {
    if (_.isArray(tag.relatedTagIds)) {
      return "has-dropdown";
    }
  },

  isEditing() {
    return Template.instance().state.equals("isEditing", true);
  },

  canEdit() {
    return Template.instance().data.canEdit;
  },

  handleMenuClose() {
    const instance = Template.instance();

    return () => {
      instance.toggleNavbarVisibility();
    };
  },

  tagTreeProps(parentTag) {
    const instance = Template.instance();

    return {
      parentTag,
      subTagGroups: TagHelpers.subTags(parentTag),
      isEditing: instance.state.equals("isEditing", true),
      ...TagNavHelpers
    };
  },
  tagProps(tag) {
    const instance = Template.instance();
    let isSelected = false;
    if (instance.data.selectedTag && tag) {
      isSelected = instance.data.selectedTag._id === tag._id;
    }

    return {
      tag,
      isEditing: instance.state.equals("isEditing", true),
      selectable: true,
      isSelected,
      className: "js-tagNav-item",
      onTagSelect(selectedTag) {
        if (JSON.stringify(selectedTag) === JSON.stringify(instance.state.get("selectedTag"))) {
          instance.state.set("selectedTag", null);
        } else {
          instance.state.set("selectedTag", selectedTag);
        }
      },
      ...TagNavHelpers
    };
  },
  blankTagProps() {
    const instance = Template.instance();

    return {
      isEditing: instance.state.equals("isEditing", true),
      blank: true,
      onTagCreate: TagNavHelpers.onTagCreate
    };
  }
});


Template.tagNav.events({
  "click .navbar-item > .rui.tag.link"(event, instance) {
    if (TagNavHelpers.isMobile()) {
      const tagId = event.target.dataset.id;
      const tags = instance.data.tags;
      const selectedTag = instance.state.get("selectedTag");

      if (selectedTag && selectedTag._id === tagId) {
        return instance.state.set("selectedTag", null);
      }

      if (TagNavHelpers.hasSubTags(tagId, tags)) {
        event.preventDefault();
        instance.state.set("selectedTag", TagNavHelpers.tagById(tagId, tags));
      }
    }
  },

  "mouseover .navbar-item, focus .navbar-item"(event, instance) {
    const tagId = event.currentTarget.dataset.id;
    const tags = instance.data.tags;

    if (TagNavHelpers.isMobile()) {
      return;
    }

    // While in edit mode, don't trigger the hover hide/show menu
    if (instance.state.equals("isEditing", false)) {
      // User mode
      // Don't show dropdown if there are no subtags
      if (TagNavHelpers.hasSubTags(tagId, tags) === false) {
        instance.state.set("selectedTag", null);
        return;
      }

      // Otherwise, show the menu
      // And Attach an event listener to the document body
      // This will check to see if the dropdown should be closed if the user
      // leaves the tag nav bar
      instance.attachBodyListener();
      instance.state.set("selectedTag", TagNavHelpers.tagById(tagId, tags));
    }
  }
});
