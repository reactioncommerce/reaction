import { composeWithTracker, merge } from "/lib/api/compose";
import { useDeps } from "react-simple-di";
import { Meteor } from "meteor/meteor";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { Sms } from "/lib/collections";
import actions from "../actions";
import SmsSettings from "../components/smsSettings";


const composer = ({}, onData) => {
  if (Meteor.subscribe("SmsSettings").ready()) {
    const settings = Sms.findOne();
    onData(null, { settings: settings });
  }
};

const depsMapper = () => ({
  saveSettings: actions.settings.saveSettings
});

export default merge(
  composeWithTracker(composer, Loading),
  useDeps(depsMapper)
)(SmsSettings);
