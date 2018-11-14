import { Template } from "meteor/templating";
import EmailLogs from "../containers/emailLogs";
import EmailConfigContainer from "../containers/EmailConfigContainer";


Template.emailSettings.helpers({
  EmailConfig() {
    return {
      component: EmailConfigContainer
    };
  },
  EmailLogs() {
    return {
      component: EmailLogs
    };
  }
});
