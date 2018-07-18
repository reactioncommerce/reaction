import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.csvImportConnectorSettings.helpers({
  component() {
    const currentData = Template.currentData() || {};

    return {
      ...currentData,
      component: Components.CSVImport
    };
  }
});
