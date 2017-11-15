import { Template } from "meteor/templating";
import ExportSettingsContainer from "../components/exportSettings";
import "./exportSettings.html";

Template.exportSettings.helpers({
  exportSettings() {
    return {
      component: ExportSettingsContainer
    };
  }
});
