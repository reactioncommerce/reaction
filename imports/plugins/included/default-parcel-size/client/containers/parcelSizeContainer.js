import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { isEmpty } from "lodash";
import ParcelSizeSettings from "../components/parcelSizeSettings";

const validateInput = (size) => {
  const errors = {};
  for (const key in size) {
    if (key !== "_id" && size.hasOwnProperty(key)) {
      if (size[key] < 0) {
        errors[key] = "Invalid input";
      }
    }
  }
  return {
    isValid: isEmpty(errors),
    errors
  };
};

const saveDefaultSize = (size, callback) => {
  const { isValid } = validateInput(size);

  if (isValid === true) {
    Meteor.call("shipping/size/save", size, (error) => {
      if (error) {
        Alerts.toast("An error occured");
      }
      Alerts.toast("Settings saved");
    });
  } else {
    Alerts.toast("Invalid inputs", "error");
  }
  return callback();
};

const composer = (props, onData) => {
  const size = props.defaultParcelSize;
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
