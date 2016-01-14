
Template.tagTree.helpers({
  tagGroupProps(groupTag) {
    const instance = Template.instance();

    return {
      groupTag,
      onTagCreate: instance.data.onTagCreate,
      onTagDragAdd: instance.data.onTagDragAdd,
      onTagRemove: instance.data.onTagRemove,
      onTagSort: instance.data.onTagSort,
      onTagUpdate: instance.data.onTagUpdate
    };
  },
  newTagGroupProps(parentTag) {
    const instance = Template.instance();

    return {
      blank: true,
      onTagCreate(newGroupName) {
        if (instance.data.onTagCreate) {
          console.log("would try to create new group", newGroupName, parentTag);
          instance.data.onTagCreate(newGroupName, parentTag);
        }
      }
    };
  }
});


Template.tagTreeNewGroup.helpers({
  props() {
    const instance = Template.instance();

    return {
      blank: true,
      onTagCreate: instance.data.onTagCreate
    };
  }
});
