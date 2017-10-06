import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.loginForm.helpers({
  component() {
    const currentData = Template.currentData() || {};

    return {
      ...currentData,
      component: Components.Login
    };
  }
});

Template.loginFormMessages.helpers({
  component() {
    const currentData = Template.currentData() || {};
    return {
      ...currentData,
      component: Components.LoginFormMessages
    };
  }
});
