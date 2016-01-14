
Template.tagItem.helpers({
  tagBlankProps(tag) {
    const instance = Template.instance();
    console.log("instane (tag blank)", instance.data.onTagCreate);
    return {
      something: "asdasd",
      onTagCreate: instance.data.onTagCreate
    }
  },

  tagEditableProps(tag) {
    const instance = Template.instance();
    console.log("instane (tag editable)", instance.data.onTagCreate);
    return {
      tag,
      onTagRemove: instance.data.onTagRemove
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
  }
});

Template.tagBlank.helpers({
  handleTagRemove(event) {
    return (tag) => {
      console.log("Remove tag", tag);
    }
  }
});

Template.tagBlank.events({
  "submit form"(event) {
    event.preventDefault();

    if (this.onTagCreate) {
      this.onTagCreate(event.target.tag.value);
    }

    event.target.tag.value = "";
  }
});
