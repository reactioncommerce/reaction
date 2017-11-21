import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
// import { Meteor } from "meteor/meteor";
// import actions from "../actions";
import { SimpleCsvExport } from "../components";


const composer = ({}, onData) => {
  onData(null);
};
//
// const handlers = {
//   saveSettings: actions.settings.saveSettings
// };

registerComponent("ExportCSV", SimpleCsvExport, [
  composeWithTracker(composer)]);

export default compose(composeWithTracker(composer))(SimpleCsvExport);
