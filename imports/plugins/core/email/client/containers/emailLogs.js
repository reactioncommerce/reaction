import { useDeps } from "react-simple-di";
import { Meteor } from "meteor/meteor";
import actions from "../actions";
import EmailLogs from "../components/emailLogs";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { Jobs } from "/lib/collections";
import { composeWithTracker, merge } from "/lib/api/compose";

const composer = ({}, onData) => {
  if (Meteor.subscribe("Emails").ready()) {
    const emails = Jobs.find().fetch();
    onData(null, { emails });
  }
};

const depsMapper = () => ({
  resend: actions.logs.resend
});

export default merge(
  composeWithTracker(composer, Loading),
  useDeps(depsMapper)
)(EmailLogs);
