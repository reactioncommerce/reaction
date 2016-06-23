import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";

Template.tagGroup.onRendered(() => {

});

Template.tagGroup.helpers({
  className() {
    const instance = Template.instance();
    if (instance.data.blank) {
      return "create";
    }
  },

  tagGroupProps(groupTag) {
    const instance = Template.instance();

    return {
      tag: groupTag,
      isEditing: instance.data.isEditing,
      onTagRemove(tag) {
        instance.data.onTagRemove(tag, instance.data.parentTag);
      },
      onTagUpdate: instance.data.onTagUpdate
    };
  },

  tagListProps(groupTag) {
    const instance = Template.instance();

    return {
      parentTag: groupTag,
      tags: TagHelpers.subTags(groupTag),
      isEditing: instance.data.isEditing,
      onTagCreate(tagName) {
        if (instance.data.onTagCreate) {
          instance.data.onTagCreate(tagName, instance.data.groupTag);
        }
      },
      onTagRemove(tag) {
        instance.data.onTagRemove(tag, instance.data.groupTag);
      },
      onTagSort(newTagsOrder) {
        instance.data.onTagSort(newTagsOrder, instance.data.groupTag);
      },
      onTagDragAdd: instance.data.onTagDragAdd,
      onTagUpdate: instance.data.onTagUpdate
    };
  }
});
