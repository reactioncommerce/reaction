import { composeWithTracker, composeAll } from "react-komposer";
import { useDeps } from "react-simple-di";
import getServiceConfig from "nodemailer-wellknown";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import actions from "../actions";
import EmailConfig from "../components/email_config";

const composer = ({}, onData) => {
  if (Meteor.subscribe("Packages").ready()) {
    const shopSettings = Reaction.getShopSettings();
    const settings = shopSettings.mail || {};

    if (settings.service && settings.service !== "custom") {
      const config = getServiceConfig(settings.service);

      // show localhost for test providers like Maildev that have no host
      settings.host = config.host || "localhost";
      settings.port = config.port;
    }

    const { service, host, port, user, password } = settings;

    // if all settings exist, check if they work
    if (service && host && port && user && password) {
      Meteor.call("email/verifySettings", (error) => {
        if (error) {
          return onData(null, { settings, status: "error", error: error.reason });
        }
        return onData(null, { settings, status: "valid", error: null });
      });
    } else {
      onData(null, { settings, status: "error", error: null });
    }
  }
};

const depsMapper = () => ({
  toggleSettings: actions.settings.toggleSettings
});

export default composeAll(
  composeWithTracker(composer, Loading),
  useDeps(depsMapper)
)(EmailConfig);
