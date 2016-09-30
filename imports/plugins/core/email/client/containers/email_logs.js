import { composeWithTracker, composeAll } from "react-komposer";
import { useDeps } from "react-simple-di";
import { Meteor } from "meteor/meteor";
import actions from "../actions";
import EmailLogs from "../components/email_logs";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { Router } from "/client/api";
import { Jobs } from "/lib/collections";

const composer = ({}, onData) => {
  const limit = Router.getQueryParam("limit");

  if (Meteor.subscribe("emailJobs", Number(limit)).ready()) {
    const emails = Jobs.find({ type: "sendEmail" }, {
      sort: {
        updated: -1
      }
    }).fetch();
    onData(null, { emails, limit });
  }
};

const depsMapper = () => ({
  resend: actions.logs.resend,
  updateLimit: actions.logs.updateLimit
});

export default composeAll(
  composeWithTracker(composer, Loading),
  useDeps(depsMapper)
)(EmailLogs);
