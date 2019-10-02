import { compose, withProps } from "recompose";
import { withApollo } from "react-apollo";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import actions from "../actions";
import SMTPEmailSettings from "../components/SMTPEmailSettings";

const providers = require("nodemailer-wellknown/services.json");

const composer = (props, onData) => {
  if (Meteor.subscribe("Packages", Reaction.getShopId()).ready()) {
    const settings = Reaction.getShopSettings().mail || {};

    const { service, host, port, user, password } = settings;

    if (host && port && user && password && !service) {
      settings.service = "custom";
    }

    onData(null, { providers, settings });
  }
};

const handlers = { saveSettings: actions.settings.saveSettings };

registerComponent("SMTPEmailSettings", SMTPEmailSettings, [
  composeWithTracker(composer),
  withProps(handlers),
  withApollo
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers),
  withApollo
)(SMTPEmailSettings);
