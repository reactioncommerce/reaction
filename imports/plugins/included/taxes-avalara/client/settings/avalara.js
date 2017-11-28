import { Template } from "meteor/templating";
import { AvalaraSettingsFormContainer } from "../containers";

Template.avalaraSettings.helpers({
  avalaraSettings() {
    return { component: AvalaraSettingsFormContainer };
  }
});
