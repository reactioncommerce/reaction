import { Template } from "meteor/templating";
import { Components } from "@reactioncommerce/reaction-components";

Template.googleWebToolsSettings.helpers({
  GoogleWebToolsSettings() {
    return Components.GoogleWebToolsSettings;
  }
});
