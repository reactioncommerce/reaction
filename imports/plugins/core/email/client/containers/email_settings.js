import { composeWithTracker, composeAll } from "react-komposer";
import { useDeps } from "react-simple-di";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import actions from "../actions";
import EmailSettings from "../components/email_settings";

const providers = Object.keys(require("nodemailer-wellknown/services.json"));

const composer = ({}, onData) => {
  if (Meteor.subscribe("Packages").ready()) {
    const settings = Reaction.getShopSettings().mail || {};

    const { service, host, port, user, password } = settings;

    if (host && port && user && password && !service) {
      settings.service = "custom";
    }

    onData(null, { providers, settings });
  }
};

const depsMapper = () => ({
  saveSettings: actions.settings.saveSettings
});

export default composeAll(
  composeWithTracker(composer, Loading),
  useDeps(depsMapper)
)(EmailSettings);
