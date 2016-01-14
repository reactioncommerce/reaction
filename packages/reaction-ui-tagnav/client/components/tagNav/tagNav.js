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
  //
  // onTagTreeEditMode(isEditing) {
  //   this.setState({lockDropdown: isEditing || false});
  // },

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

});

Template.tagNav.helpers({
  tagTreeProps(parentTag) {
    return {
      parentTag,
      subTagGroups: TagHelpers.subTags(parentTag),
      editable: true,
      ...TagNavHelpers
    };
  },
  tagListProps(tags) {
    return {
      tags,
      editable: true,
      ...TagNavHelpers
    };
  }
});
