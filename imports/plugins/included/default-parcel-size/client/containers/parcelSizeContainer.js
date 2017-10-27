import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import ParcelSizeSettings from "../components/parcelSizeSettings";

const saveDefaultSize = (size, callback) => {
  Meteor.call("shipping/size/save", size, (error) => {
    if (error) {
      Alerts.toast("An error occured");
    }
    Alerts.toast("Settings saved");
  });
  return callback();
};

const composer = ({}, onData) => {
  onData(null, {
    size: {
      weight: 10,
      height: 10,
      length: 10,
      width: 10
    },
    saveDefaultSize
  });
};

registerComponent("ParcelSizeSettings", ParcelSizeSettings, [
  composeWithTracker(composer),
  withProps({})
]);

export default compose(
  composeWithTracker(composer),
  withProps({})
)(ParcelSizeSettings);
