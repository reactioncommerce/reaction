/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Email",
  name: "reaction-email-notifications",
  icon: "fa fa-envelope-square",
  autoEnable: true,
  settings: {
    name: "Send email notifications"
  },
  registry: [{
    provides: "dashboard",
    template: "emailTemplateDashboard",
    label: "Email notifications",
    description: "Send email notifications",
    icon: "fa fa-envelope-square",
    priority: 4,
    container: "core"
  }]
});
