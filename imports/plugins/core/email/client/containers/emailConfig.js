import { useDeps } from "react-simple-di";
import getServiceConfig from "nodemailer-wellknown";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import actions from "../actions";
import EmailConfig from "../components/emailConfig";
import { composeWithTracker, merge } from "/lib/api/compose";

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

    return onData(null, { settings, status: "error", error: null });
  }
};

const depsMapper = () => ({
  toggleSettings: actions.settings.toggleSettings
});

export default merge(
  composeWithTracker(composer, Loading),
  useDeps(depsMapper)
)(EmailConfig);
