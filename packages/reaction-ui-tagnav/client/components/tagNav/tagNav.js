const TagHelpers = ReactionUI.TagNav.Helpers;

Template.tagNav.onCreated(function () {

});


const TagNavHelpers = {

};

Template.tagNav.helpers({
  tagListProps(tags) {
    return {
      tags,
      editable: true,
      onTagCreate(tagName, parentTag) {
        console.log("just about to create tag", tagName, parentTag);
        TagHelpers.createTag(tagName, undefined, parentTag);
      },
      onTagRemove(tag, parentTag) {
        console.log("just about to remove tag", tag, parentTag);

        // TagHelpers.removeTag(tag, parentTag);
      },
      //
      // onTagTreeEditMode(isEditing) {
      //   this.setState({lockDropdown: isEditing || false});
      // },

      onTagSort(tagIds, parentTag) {
        console.log("just about to sort tags", tags, parentTag);

        TagHelpers.sortTags(tagIds, parentTag);
      },

      onTagDragAdd(movedTagId, toListId, toIndex, ofList) {
        TagHelpers.moveTagToNewParent(movedTagId, toListId, toIndex, ofList);
      },

      onTagRemove(tag, parentTag) {
        TagHelpers.removeTag(tag, parentTag);
      },

      onTagUpdate(tagId, tagName) {
        TagHelpers.updateTag(tagId, tagName);
      }
    }
  }
});
