import Sortable from "sortablejs";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";

Template.tagTree.onRendered(() => {
  const instance = Template.instance();
  const list = instance.$(".content")[0];

  instance._sortable = Sortable.create(list, {
    group: "tagGroup",
    handle: ".js-drag-handle",
    draggable: ".rui.grouptag",
    onSort(event) {
      const tagIds = instance.data.subTagGroups.map(item => {
        if (item) {
          return item._id;
        }
      });

      const newTagsOrder = TagHelpers.moveItem(tagIds, event.oldIndex, event.newIndex);

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
      const tagIds = instance.data.subTagGroups.map(item => {
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
        const foundTag = _.find(instance.data.subTagGroups, (tag) => {
          return tag._id === movedTagId;
        });

        instance.data.onTagRemove(foundTag, instance.data.parentTag);
      }
    }
  });
});

Template.tagTree.helpers({
  isEditing() {
    return Template.instance().data.isEditing;
  },

  tagGroupProps(groupTag) {
    const instance = Template.instance();

    return {
      groupTag,
      parentTag: instance.data.parentTag,
      isEditing: instance.data.isEditing,
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
