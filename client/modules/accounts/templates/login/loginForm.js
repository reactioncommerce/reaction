import { Template } from "meteor/templating";
import { LoginContainer } from "../../containers";

Template.loginForm.helpers({
  component() {
    const currentData = Template.currentData() || {};
    return {
      ...currentData,
      component: LoginContainer
    };
  }
});
