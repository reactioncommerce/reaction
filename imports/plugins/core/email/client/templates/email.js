import EmailStatusPage from "../components/email_status_page";
import EmailSettings from "../containers/email_settings";

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
  EmailSettings() {
    return {
      component: EmailSettings
    };
  }
});
