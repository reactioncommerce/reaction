const classnames = ReactionUI.Lib.classnames;

/**
 * Select - onCreated
 */
Template.select.onCreated(function () {
  this.state = new ReactiveDict();
});

/**
 * Select - events
 */
Template.select.events({
  "change select, change input"(event, template) {
    if (template.data.onSelect) {
      template.data.onSelect(event.target.value, event);
    }
  }
});

/**
 * Select - helpers
 */
Template.select.helpers({
  template() {
    const type = Template.currentData().type;
    if (type === "radios" || type === "radio") {
      return "selectAsRadioButtons";
    } else if (type === "checkboxes" || type === "checkbox") {
      return "selectAsCheckboxes";
    }

    return "selectAsDropdown";
  }
});

/**
 * Select (As a set of radio buttons) - helpers
 */
Template.selectAsRadioButtons.helpers({
  className() {
    const instance = Template.instance();
    const data = instance.data;

    const classes = classnames({
      hidden: data.hideControl
    });

    return classes;
  },

  templateData(option) {
    const instance = Template.instance();
    const data = instance.data;

    return {
      selected: data.selected === option[data.key || "_id"],
      option
    }
  },
  /**
   * checked attribute helper
   * @param  {Object} option Option object
   * @return {String|undefined} returns "chekced" if selected, undefined otherwise
   */
  checked(option) {
    const data = Template.currentData();

    if (data.selected === option[data.key || "_id"]) {
      return "checked";
    }
  }
});

/**
 * Select (As a set of checkboxes) - helpers
 */
Template.selectAsCheckboxes.helpers({
  /**
   * checked attribute helper
   * @param  {Object} option Option object
   * @return {String|undefined} returns "chekced" if selected, undefined otherwise
   */
  checked(option) {
    const data = Template.currentData();

    if (data.selected === option[data.key || "_id"]) {
      return "checked";
    }
  }
});
