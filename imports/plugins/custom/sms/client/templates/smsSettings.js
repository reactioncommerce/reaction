import SmsSettings from "../containers/smsSettingsContainer";
import { Template } from "meteor/templating";

Template.smsSettings.helpers({
  SmsSettings() {
    return {
      component: SmsSettings
    };
  }
});
