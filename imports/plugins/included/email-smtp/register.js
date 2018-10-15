import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "Email",
  name: "reaction-email-smtp",
  icon: "fa fa-envelope-o",
  autoEnable: true,
  registry: [
    {
      provides: ["emailProviderConfig"],
      template: "SMTPEmailConfig"
    }
  ]
});
