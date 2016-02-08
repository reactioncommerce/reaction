
Template.select.onCreated(function () {
  this.state = new ReactiveDict();
});

Template.select.events({
  "select select"(event, template) {
    if (template.instance.data.onSelect) {
      template.instance.data.onSelect(event.target.value);
    }
  }
});

Template.select.helpers({
  
});
