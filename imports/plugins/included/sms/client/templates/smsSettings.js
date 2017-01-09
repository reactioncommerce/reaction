import { Template } from "meteor/templating";
import SmsSettings from "../containers/smsSettingsContainer";

Template.smsSettings.helpers({
  SmsSettings() {
    return {
      component: SmsSettings
    };
  }
});
