import { Reaction } from "/server/api";

export default function () {
  Reaction.registerPackage({
    label: "Email Templates",
    name: "reaction-email-templates",
    icon: "fa fa-envelope-square",
    autoEnable: true,
    settings: {
      name: "Email"
    },
    registry: [{
      provides: "dashboard",
      template: "emailTemplateDashboard",
      label: "Email",
      description: "Email templates",
      icon: "fa fa-envelope-square",
      priority: 4,
      container: "appearance"
    }]
  });
}
