import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import ParcelDimensionSettings from "../components/parcelDimensionSettings.js";


const composer = ({}, onData) => {
  onData(null, {});
};

registerComponent("ParcelDimensionSettings", ParcelDimensionSettings, [
  composeWithTracker(composer),
  withProps({})
]);

export default compose(
  composeWithTracker(composer),
  withProps({})
)(ParcelDimensionSettings);
