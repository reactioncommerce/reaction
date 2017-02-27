import EmailStatusPage from "../components/emailStatusPage";
import EmailSettings from "../containers/emailSettings";

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
