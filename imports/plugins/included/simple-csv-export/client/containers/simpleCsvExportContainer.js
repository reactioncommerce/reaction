import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
// import { Meteor } from "meteor/meteor";
// import actions from "../actions";
import SimpleCSVExport from "../components/simpleCSVExport";


const composer = ({}, onData) => {
  onData(null);
};
//
// const handlers = {
//   saveSettings: actions.settings.saveSettings
// };

registerComponent("ExportCSV", SimpleCSVExport, [
  composeWithTracker(composer)]);

export default compose(composeWithTracker(composer))(SimpleCSVExport);
