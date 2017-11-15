import { Template } from "meteor/templating";
import ExportSettings from "../components/exportSettings";
import "./exportSettings.html";

Template.exportSettings.helpers({
  exportSettings() {
    return {
      component: ExportSettings
    };
  }
});
