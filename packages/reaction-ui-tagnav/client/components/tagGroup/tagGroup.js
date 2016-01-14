const TagHelpers = ReactionUI.TagNav.Helpers;

Template.tagGroup.helpers({
  tagProps(groupTag) {
    const instance = Template.instance();

    return {
      tag: groupTag,
      editable: true
    };
  },

  tagListProps(groupTag) {
    const instance = Template.instance();

    return {
      tags: TagHelpers.subTags(groupTag),
      editable: true,
      onTagCreate(tagName) {
        if (instance.data.onTagCreate) {
          instance.data.onTagCreate(tagName, instance.data.groupTag);
        }
      }
    };
  }
});
