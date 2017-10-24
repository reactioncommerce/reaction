import { Template } from "meteor/templating";
/**
* @typedef CardProps
* @type Object
* @property {Object} controls Reaction UI Button or other control props
* @property {function} onContentClick y The Y
*/

Template.card.events({
  "click .content"(event, instance) {
    if (instance.data.onContentClick) {
      instance.data.onContentClick(event);
    }
  }
});
