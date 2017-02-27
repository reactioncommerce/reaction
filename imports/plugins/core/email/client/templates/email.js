import EmailLogs from "../containers/emailLogs";
import EmailStatusPage from "../components/emailStatusPage";
import EmailSettings from "../containers/emailSettings";
import EmailConfig from "../containers/emailConfig";

// main page content
Template.emailStatusPage.helpers({
  EmailStatusPage() {
    return {
      component: EmailStatusPage
    };
  }
});


// settings popout (Reaction.showActionView())
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
  },
  EmailSettings() {
    return {
      component: EmailSettings
    };
  }
});
