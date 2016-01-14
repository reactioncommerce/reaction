"use strict";
const Sortable = ReactionUI.Lib.Sortable;
const TagHelpers = ReactionUI.TagNav.Helpers;

Template.tagTree.onRendered(() => {
  const instance = Template.instance();
  const list = instance.$(".content")[0];

  instance._sortable = Sortable.create(list, {
    group: "tagGroups",
    filter: ".rui.tagnav.group.create",
    onSort(event) {
      let tagIds = instance.data.subTagGroups.map(item => {
        if (item) {
          return item._id;
        }
      });

      let newTagsOrder = TagHelpers.moveItem(tagIds, event.oldIndex, event.newIndex);

      if (newTagsOrder) {
        console.log("Am anout to sort tags", newTagsOrder, instance.data.parentTag);
        if (instance.data.onTagSort) {
          instance.data.onTagSort(newTagsOrder, instance.data.parentTag);
        }
      }
    },

    // On add from another list
    onAdd(event) {
      const toListId = event.to.dataset.id;
      const movedTagId = event.item.dataset.id;
      let tagIds = instance.data.subTagGroups.map(item => {
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
        let foundTag = _.find(instance.data.subTagGroups, (tag) => {
          return tag._id === movedTagId;
        });

        console.log("Am anout to (remove) tag", foundTag, instance.data.parentTag);


        return;
        instance.data.onTagRemove(foundTag, instance.data.parentTag);
      }
    }
  });
});

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
