import Sortable from "sortablejs";

Template.tagList.onCreated(function () {
  this.moveItem = (array, fromIndex, toIndex) => {
    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);

    return array;
  };
});

Template.tagList.onRendered(() => {
  const instance = Template.instance();
  const list = instance.$(".rui.tags")[0];

  instance._sortable = Sortable.create(list, {
    group: "tags",
    draggable: ".rui.item.draggable",
    // filter: ".rui.tag.edit.create",
    onSort(event) {
      const tagIds = instance.data.tags.map(item => {
        if (item) {
          return item._id;
        }
      });

      const newTagsOrder = instance.moveItem(tagIds, event.oldIndex, event.newIndex);

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
      const tagIds = instance.data.tags.map(item => {
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
        const foundTag = _.find(instance.data.tags, (tag) => {
          return tag._id === movedTagId;
        });

        instance.data.onTagRemove(foundTag, instance.data.parentTag);
      }
    }
  });
});

Template.tagList.helpers({
  isEditing() {
    return Template.instance().data.isEditing;
  },

  tagProps(tag) {
    const instance = Template.instance();
    let isSelected = false;
    if (instance.data.selectedTag && tag) {
      isSelected = instance.data.selectedTag._id === tag._id;
    }

    return {
      tag,
      isEditing: instance.data.isEditing,
      selectable: instance.data.selectable,
      controls: instance.data.controls,
      isSelected,
      onTagSelect: instance.data.onTagSelect,
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

  /**
   * Arguments (Props) to pass into the blank tag for creating new tags
   * @return {Object} An object containing props
   */
  tagBlankProps() {
    const instance = Template.instance();
    return {
      blank: true,
      onTagCreate(tagName) {
        if (instance.data.onTagCreate) {
          instance.data.onTagCreate(tagName, instance.data.parentTag);
        }
      }
    };
  }
});
