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
 * Select (As a set of Radio Buttons) - helpers
 */
Template.selectAsRadioButtons.helpers({
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
