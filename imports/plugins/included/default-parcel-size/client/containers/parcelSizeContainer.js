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

const composer = (props, onData) => {
  const size = props.settings.size;
  onData(null, {
    size,
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
