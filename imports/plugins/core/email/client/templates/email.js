import EmailStatusPage from "../components/email_status_page";
import EmailDashboardTabs from "../components/email_dashboard_tabs";
import EmailSettings from "../containers/email_settings";

// main page content
Template.emailStatusPage.helpers({
  EmailStatusPage() {
    return {
      component: EmailStatusPage
    };
  }
});

// navigation tabs
Template.emailDashboardTabs.helpers({
  EmailDashboardTabs() {
    return {
      component: EmailDashboardTabs
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
