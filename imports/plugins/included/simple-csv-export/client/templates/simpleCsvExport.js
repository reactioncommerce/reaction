import { Template } from "meteor/templating";
import { SimpleCsvExport } from "../components";
import "./simpleCsvExport.html";

Template.simpleCsvExport.helpers({
  exportCSV() {
    return {
      component: SimpleCsvExport
    };
  }
});
