import { Template } from "meteor/templating";
import { ExportSettingsContainer } from "../containers";
import "./exportSettings.html";

Template.exportSettings.helpers({
  exportSettings() {
    return {
      component: ExportSettingsContainer
    };
  }
});
