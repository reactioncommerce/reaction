"use strict";
const Sortable = ReactionUI.Lib.Sortable;


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
    onSort(event) {
      let tagIds = instance.data.tags.map(item => item._id);
      let newTagsOrder = instance.moveItem(tagIds, event.oldIndex, event.newIndex);

      if (newTagsOrder) {
        if (instance.data.onTagSort) {
          instance.data.onTagSort(newTagsOrder, instance.data.parentTag);
        }
      }
    }
    // onAdd: this.handleDragAdd,
    // onRemove: this.handleDragRemove
  });
});

Template.tagList.helpers({
  tagProps(tag) {
    const instance = Template.instance();
    return {
      tag,
      editable: instance.data.editable,
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
        console.log("tagList - create tag - ", tagName);

        if (instance.data.onTagCreate) {
          instance.data.onTagCreate(tagName, instance.data.parentTag);
        }
      }
    };
  }
});
