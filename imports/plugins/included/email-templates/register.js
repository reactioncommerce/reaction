import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/mutations";
import startup from "./server/startup";

Reaction.registerPackage({
  label: "Email Templates",
  name: "reaction-email-templates",
  icon: "fa fa-envelope-o",
  autoEnable: true,
  functionsByType: {
    startup: [startup]
  },
  mutations
});
