
Template.tagList.helpers({
  tagProps(tag) {
    const instance = Template.instance();
    return {
      tag,
      editable: instance.data.editable,
      onTagRemove(tag) {
        console.log("Tag list (Remove)", tag);

        // Pass the tag back up to the parent component for removal
        // -- include the parent tag
        if (instance.data.onTagCreate) {
          instance.data.onTagRemove(tag, instance.data.parentTag);
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
