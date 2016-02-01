
Template.button.helpers({
  type() {
    return Template.instance().data.type || "button";
  }
});

Template.button.events({
  "click button"(event) {
    if (this.onClick) {
      this.onClick(event);
    }
  }
});
