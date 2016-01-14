
Template.tagItem.helpers({
  tagBlankProps(tag) {
    const instance = Template.instance();
    return {
      something: "asdasd",
      onTagCreate: instance.data.onTagCreate
    }
  },

  tagEditableProps(tag) {
    const instance = Template.instance();
    return {
      tag,
      onTagRemove: instance.data.onTagRemove,
      onTagUpdate: instance.data.onTagUpdate
    }
  }
});

Template.tagEditable.helpers({
  handleTagRemove(event) {
    const instance = Template.instance();
    return (tag) => {
      // Pass the tag back up to the parent component
      if(instance.data.onTagRemove) {
        instance.data.onTagRemove(instance.data.tag);
      }
    };
  },
});


Template.tagEditable.events({
  "submit form"(event) {
    event.preventDefault();
    if (this.onTagUpdate) {
      this.onTagUpdate(this.tag._id, event.target.tag.value);
    }
  }
});



Template.tagBlank.helpers({});

Template.tagBlank.events({
  "submit form"(event) {
    event.preventDefault();

    if (this.onTagCreate) {
      this.onTagCreate(event.target.tag.value);
    }

    event.target.tag.value = "";
  }
});
