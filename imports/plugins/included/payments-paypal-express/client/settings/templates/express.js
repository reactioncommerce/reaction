import { Template } from "meteor/templating";
import { ExpressSettingsFormContainer } from "../containers";
import "./express.html";

Template.paypalExpressSettings.onCreated(function () {
  console.log("hello paypal");
});

Template.paypalExpressSettings.helpers({
  ExpressSettings() {
    return {
      component: ExpressSettingsFormContainer
    };
  }
});
