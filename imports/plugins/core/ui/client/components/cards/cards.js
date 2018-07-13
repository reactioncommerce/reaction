import { Template } from "meteor/templating";

Template.card.events({
  "click .content"(event, instance) {
    if (instance.data.onContentClick) {
      instance.data.onContentClick(event);
    }
  }
});
