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

  this.attachBodyListener = () => {
    document.body.addEventListener("mouseover", this.closeDropdown);
    this.state.set("attachedBodyListener", true);
  };

  this.detachhBodyListener = () => {
    document.body.removeEventListener("mouseover", this.closeDropdown);
    this.state.set("attachedBodyListener", false);
  };

  this.closeDropdown = (event) => {
    if ($(event.target).parents(".rui.tagnav").length === 0) {
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

Template.tagNav.helpers({
  dropDownIsHidden(tag) {
    const selectedTag = Template.instance().state.get("selectedTag");

    if (selectedTag) {
      if (selectedTag._id === tag._id) {
        return "open";
      }
    }
    return "hidden";
  },
  isEditing() {
    return Template.instance().state.equals("isEditing", true);
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
  "mouseover .navbar .rui.tag.link, focus .navbar .rui.tag.link"(event, instance) {
    const tagId = event.target.dataset.id;

    // Attach an event listener to the document body
    // This will check to see if the dropdown should be closed if the user
    // leaves the tag nav bar
    instance.attachBodyListener();

    const foundTag = _.find(instance.data.tags, (tag) => tag._id === tagId);
    instance.state.set("selectedTag", foundTag);
  }
});
