import { Template } from "meteor/templating";
import { ExpressSettingsFormContainer } from "../containers";
import "./express.html";

Template.paypalExpressSettings.helpers({
  ExpressSettings() {
    return {
      component: ExpressSettingsFormContainer
    };
  }
});
