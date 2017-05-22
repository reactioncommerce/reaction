import { Template } from "meteor/templating";
import { LoginContainer, MessagesContainer } from "../../containers";

Template.loginForm.helpers({
  component() {
    const currentData = Template.currentData() || {};
    console.log("Login component", currentData);

    return {
      ...currentData,
      component: LoginContainer
    };
  }
});

Template.loginFormMessages.helpers({
  component() {
    const currentData = Template.currentData() || {};
    console.log("Login form messages", currentData);
    return {
      ...currentData,
      component: MessagesContainer
    };
  }
});
