const TagHelpers = ReactionUI.TagNav.Helpers;

Template.tagGroup.onRendered(() => {

});

Template.tagGroup.helpers({
  className() {
    const instance = Template.instance();
    if (instance.data.blank) {
      return "create";
    }
  },

  tagProps(groupTag) {
    const instance = Template.instance();

    return {
      tag: groupTag,
      editable: instance.data.editable
    };
  },

  tagListProps(groupTag) {
    const instance = Template.instance();

    return {
      parentTag: groupTag,
      tags: TagHelpers.subTags(groupTag),
      editable: instance.data.editable,
      onTagCreate(tagName) {
        if (instance.data.onTagCreate) {
          instance.data.onTagCreate(tagName, instance.data.groupTag);
        }
      },
      onTagRemove(tagName) {
        instance.data.onTagRemove(tagName, instance.data.groupTag);
      },
      onTagSort(newTagsOrder) {
        instance.data.onTagSort(newTagsOrder, instance.data.groupTag);
      },
      onTagDragAdd: instance.data.onTagDragAdd
    };
  }
});
