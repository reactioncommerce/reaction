import { Template } from "meteor/templating";
import { MessagesContainer } from "../../containers";

Template.loginFormMessages.helpers({
  component() {
    const currentData = Template.currentData() || {};
    return {
      ...currentData,
      component: MessagesContainer
    };
  }
});
