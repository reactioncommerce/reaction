"use strict";
const Sortable = ReactionUI.Lib.Sortable;
const TagHelpers = ReactionUI.TagNav.Helpers;

const TagNavHelpers = {
  onTagCreate(tagName, parentTag) {
    // console.log("just about to create tag", tagName, parentTag);
    TagHelpers.createTag(tagName, undefined, parentTag);
  },
  onTagRemove(tag, parentTag) {
    // console.log("(X) just about to remove tag", tag, parentTag);

    TagHelpers.removeTag(tag, parentTag);
  },

  onTagSort(tagIds, parentTag) {
    // console.log("(-) just about to sort tags", tagIds, parentTag);

    TagHelpers.sortTags(tagIds, parentTag);
  },

  onTagDragAdd(movedTagId, toListId, toIndex, ofList) {
    // console.log("(+) just about to add tag", movedTagId, toListId, toIndex, ofList);
    TagHelpers.moveTagToNewParent(movedTagId, toListId, toIndex, ofList);
  },

  onTagUpdate(tagId, tagName) {
    TagHelpers.updateTag(tagId, tagName);
  }
};

Template.tagNav.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    attachedBodyListener: false,
    isEditing: false,
    selectedTag: null
  });

  this.moveItem = (array, fromIndex, toIndex) => {
    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);
    return array;
  };

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

      console.log(event.target, $(event.target).parents(".navbar-item"));

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
});

Template.tagNav.onRendered(() => {
  const instance = Template.instance();
  const list = instance.$(".navbar-items")[0];

  // return
  instance._sortable = Sortable.create(list, {
    group: "tags",
    handle: ".js-drag-handle",
    // draggable: ".rui.tag.edit.draggable",
    // filter: ".rui.tag.edit.create",
    onSort(event) {
      let tagIds = instance.data.tags.map(item => {
        if (item) {
          return item._id;
        }
      });

      let newTagsOrder = instance.moveItem(tagIds, event.oldIndex, event.newIndex);

      if (newTagsOrder) {
        if (instance.data.onTagSort) {
          instance.data.onTagSort(newTagsOrder, instance.data.parentTag);
        }
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

      if (instance.data.onTagDragAdd) {
        instance.data.onTagDragAdd(movedTagId, toListId, event.newIndex, tagIds);
      }
    },

    // Tag removed from list becuase it was dragged to a different list
    onRemove(event) {
      const movedTagId = event.item.dataset.id;

      if (instance.data.onTagRemove) {
        let foundTag = _.find(instance.data.tags, (tag) => {
          return tag._id === movedTagId;
        });

        instance.data.onTagRemove(foundTag, instance.data.parentTag);
      }
    }
  });
});

Template.tagNav.helpers({
  navbarSelectedClassName(tag) {
    const selectedTag = Template.instance().state.get("selectedTag");

    if (selectedTag) {
      if (selectedTag._id === tag._id) {
        return "selected";
      }
    }
    return "";
  },
  isEditing() {
    return Template.instance().state.equals("isEditing", true);
  },
  editable() {
    return Template.instance().data.editable;
  },
  onEditTags() {
    const instance = Template.instance();

    return () => {
      if (instance.data.editable) {
        const isEditing = instance.state.equals("isEditing", true);
        instance.state.set("isEditing", !isEditing);
        instance.state.set("selectedTag", null);
        // instance.detachhBodyListener();
      }
    };
  },
  tagTreeProps(parentTag) {
    const instance = Template.instance();

    return {
      parentTag,
      subTagGroups: TagHelpers.subTags(parentTag),
      editable: instance.state.equals("isEditing", true),
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
      editable: instance.state.equals("isEditing", true),
      selectable: true,
      isSelected,
      onTagSelect(selectedTag) {
        instance.state.set("selectedTag", selectedTag);
      },
      onTagRemove(tagToRemove) {
        // Pass the tag back up to the parent component for removal
        // -- include the parent tag
        if (instance.data.onTagCreate) {
          instance.data.onTagRemove(tagToRemove, instance.data.parentTag);
        }
      },
      onTagUpdate(tagId, tagName) {
        // Pass the tagId and tagName back up to the parent component for updating
        if (instance.data.onTagUpdate) {
          instance.data.onTagUpdate(tagId, tagName);
        }
      }
    };
  },
  tagListProps(tags) {
    const instance = Template.instance();

    return {
      tags,
      editable: instance.state.equals("isEditing", true),
      selectable: true,
      selectedTag: instance.state.get("selectedTag"),
      onTagSelect(tag) {
        instance.state.set("selectedTag", tag);
      },
      ...TagNavHelpers
    };
  }
});


Template.tagNav.events({
  "click .navbar-item > .rui.tag.link"(event, instance) {
    if (window.matchMedia("(max-width: 991px)").matches) {
      const tagId = event.target.dataset.id;
      const tags = instance.data.tags;
      const foundTag = _.find(tags, (tag) => {
        return tag._id === tagId;
      });

      if (foundTag) {
        if (_.isArray(foundTag.relatedTagIds) && foundTag.relatedTagIds.length) {
          event.preventDefault();

          instance.state.set("selectedTag", foundTag);

          console.log("show the dropdown instead of navigating to the link");
        }
      }
    }
  },

  "mouseover .navbar-item, focus .navbar-item"(event, instance) {
    const tagId = event.currentTarget.dataset.id;

    if (window.matchMedia("(max-width: 991px)").matches) {
      return;
    }

    if (instance.state.equals("isEditing", false)) {
      // Attach an event listener to the document body
      // This will check to see if the dropdown should be closed if the user
      // leaves the tag nav bar
      instance.attachBodyListener();

      const foundTag = _.find(instance.data.tags, (tag) => tag._id === tagId);
      instance.state.set("selectedTag", foundTag);
    }
  }
});
