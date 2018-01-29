import { Template } from "meteor/templating";
import { ExampleSettingsFormContainer } from "../containers";
import "./example.html";

Template.exampleSettings.helpers({
  ExampleSettings() {
    return {
      component: ExampleSettingsFormContainer
    };
  }
});
