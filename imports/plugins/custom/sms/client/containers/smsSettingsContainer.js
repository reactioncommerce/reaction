import { composeWithTracker, composeAll } from "react-komposer";
import { useDeps } from "react-simple-di";
import { Meteor } from "meteor/meteor";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { Sms } from "/lib/collections";
import actions from "../actions";
import SmsSettings from "../components/smsSettings";


const composer = ({}, onData) => {
  if (Meteor.subscribe("Sms").ready()) {
    const settings = Sms.find().fetch();
    onData(null, { settings: settings[0] });
  }
};

const depsMapper = () => ({
  saveSettings: actions.settings.saveSettings
});

export default composeAll(
  composeWithTracker(composer, Loading),
  useDeps(depsMapper)
)(SmsSettings);
