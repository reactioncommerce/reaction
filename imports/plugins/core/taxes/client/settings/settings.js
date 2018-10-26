import { Template } from "meteor/templating";
import GeneralTaxSettings from "../containers/GeneralTaxSettings";

/*
 * Template taxes Helpers
 */
Template.taxSettings.helpers({
  GeneralTaxSettings() {
    return GeneralTaxSettings;
  }
});
