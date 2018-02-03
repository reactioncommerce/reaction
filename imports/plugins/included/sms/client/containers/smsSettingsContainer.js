import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Sms } from "/lib/collections";
import actions from "../actions";
import SmsSettings from "../components/smsSettings";

const composer = (props, onData) => {
  if (Meteor.subscribe("SmsSettings").ready()) {
    const settings = Sms.findOne();
    onData(null, { settings });
  }
};

const handlers = {
  saveSettings: actions.settings.saveSettings
};

registerComponent("SmsSettings", SmsSettings, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(SmsSettings);
