import { Template } from "meteor/templating";
import EmailLogs from "../containers/emailLogs";
import EmailConfig from "../containers/emailConfig";


Template.emailSettings.helpers({
  EmailConfig() {
    return {
      component: EmailConfig
    };
  },
  EmailLogs() {
    return {
      component: EmailLogs
    };
  }
});
