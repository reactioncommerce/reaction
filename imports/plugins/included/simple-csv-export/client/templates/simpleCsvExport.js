import { Template } from "meteor/templating";
import { Components } from "@reactioncommerce/reaction-components";

Template.simpleCsvExport.helpers({
  exportCSV() {
    return {
      component: Components.ExportCSV
    };
  }
});
