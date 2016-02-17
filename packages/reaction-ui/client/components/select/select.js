
Template.select.onCreated(function () {
  this.state = new ReactiveDict();
});

Template.select.events({
  "change select"(event, template) {
    if (template.data.onSelect) {
      template.data.onSelect(event.target.value);
    }
  }
});

Template.select.helpers({

});
