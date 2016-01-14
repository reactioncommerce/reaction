
Template.button.events({
  "click button"(event) {
    if (this.onClick) {
      this.onClick(event);
    }
  }
});
