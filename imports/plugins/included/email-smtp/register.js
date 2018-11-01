import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/startup";

Reaction.registerPackage({
  label: "Email",
  name: "reaction-email-smtp",
  icon: "fa fa-envelope-o",
  autoEnable: true,
  functionsByType: {
    startup: [startup]
  },
  registry: [
    {
      provides: ["emailProviderConfig"],
      template: "SMTPEmailConfig"
    }
  ]
});
