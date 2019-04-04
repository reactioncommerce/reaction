import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/no-meteor/startup";
import info from "./info";

Reaction.registerPackage({
  label: info.displayName,
  name: info.packageName,
  icon: info.icon,
  autoEnable: true,
  settings: {
    public: {
      enabled: false,
      path: "/metrics"
    }
  },
  functionsByType: {
    startup: [startup]
  }
});
