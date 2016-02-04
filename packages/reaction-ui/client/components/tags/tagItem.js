"use strict";
const classnames = ReactionUI.Lib.classnames;

Template.tagItem.helpers({
  tagBlankProps() {
    const instance = Template.instance();
    return {
      onTagCreate: instance.data.onTagCreate
    };
  },

  tagEditableProps(tag) {
    const instance = Template.instance();
    return {
      tag,
      className: instance.data.className,
      isSelected: instance.data.isSelected,
      selectable: instance.data.selectable,
      onTagRemove: instance.data.onTagRemove,
      onTagSelect: instance.data.onTagSelect,
      onTagUpdate: instance.data.onTagUpdate
    };
  }
});

Template.tagEditable.onCreated(function () {
  // this.autorun(() => {
  //   new SimpleSchema({
  //     tag: {type: }
  //   })
  // })
});

Template.tagEditable.onRendered(() => {
  const instance = Template.instance();
  const textInput = instance.$("input")[0];

  $(textInput).autocomplete({
    delay: 0,
    source: function (request, response) {
      let datums = [];
      let slug = getSlug(request.term);
      ReactionCore.Collections.Tags.find({
        slug: new RegExp(slug, "i")
      }).forEach(function (tag) {
        return datums.push({
          label: tag.name
        });
      });
      return response(datums);
    },
    select: (selectEvent, ui) => {
      if (ui.item.value) {
        if (instance.data.onTagUpdate) {
          instance.data.onTagUpdate(instance.data.tag._id, ui.item.value);
        }
      }
    }
  });
});

Template.tagEditable.helpers({
  className() {
    const instance = Template.instance();

    return classnames(instance.data.className, {
      selected: instance.data.classes
    });
  },

  handleTagSelect() {
    const instance = Template.instance();
    return () => {
      // Pass the tag back up to the parent component
      if (instance.data.onTagSelect) {
        instance.data.onTagSelect(instance.data.tag);
      }
    };
  },
  handleTagRemove() {
    const instance = Template.instance();
    return () => {
      // Pass the tag back up to the parent component
      if (instance.data.onTagRemove) {
        instance.data.onTagRemove(instance.data.tag);
      }
    };
  }
});


Template.tagEditable.events({
  "submit form"(event) {
    event.preventDefault();

    if (this.onTagUpdate) {
      this.onTagUpdate(this.tag._id, event.target.tag.value);
    }
  },

  "blur input"(event) {
    // Trigger form submit
    $(event.target).closest("form").submit();
  }
});


Template.tagBlank.onRendered(() => {
  const instance = Template.instance();
  const textInput = instance.$("input")[0];

  $(textInput).autocomplete({
    delay: 0,
    source: function (request, response) {
      let datums = [];
      let slug = getSlug(request.term);
      ReactionCore.Collections.Tags.find({
        slug: new RegExp(slug, "i")
      }).forEach(function (tag) {
        return datums.push({
          label: tag.name
        });
      });
      return response(datums);
    },
    select: (selectEvent, ui) => {
      if (ui.item.value) {
        if (instance.data.onTagUpdate) {
          instance.data.onTagUpdate(instance.data.tag._id, ui.item.value);
        }
      }
    }
  });
});

Template.tagBlank.helpers({});

Template.tagBlank.events({
  "submit form"(event) {
    event.preventDefault();
    const value = event.target.tag.value.trim();

    if (this.onTagCreate && _.isEmpty(value) === false) {
      this.onTagCreate(value);
    }

    event.target.tag.value = "";
  },

  "blur input"(event) {
    // Trigger form submit
    $(event.target).closest("form").submit();
  },

  "keydown input"(event) {
    if (event.keyCode === 9) {
      event.preventDefault();

      // Trigger form submit
      $(event.target).closest("form").submit();
    }
  }
});
