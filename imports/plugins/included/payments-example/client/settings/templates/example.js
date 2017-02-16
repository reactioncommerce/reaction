import { ExampleSettingsFormContainer } from "../containers";
import { Template } from "meteor/templating";
import "./example.html";

Template.exampleSettings.helpers({
  ExampleSettings() {
    return {
      component: ExampleSettingsFormContainer
    };
  }
});
