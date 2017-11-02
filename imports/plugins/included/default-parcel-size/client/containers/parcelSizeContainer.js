import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api/";
import { isEmpty } from "lodash";
import { Shops } from "/lib/collections";
import ParcelSizeSettings from "../components/parcelSizeSettings";

/**
 * @method isNumber
 * @summary checks if an input is an integer or a decimal
 * @param {String} input - input string
 * @since 1.5.5
 * @return {Boolean} - returns a boolean result
 */
const isNumber = (input) => {
  return /^\d+(\.\d{1,2})?$/.test(input);
};

/**
 * @method validateInput
 * @summary checks if each key in size object is a number
 * @param {object} size - an object with weight, length, width, and height keys
 * @since 1.5.5
 * @return {Object} - returns an object with isValid, erros, sizeInt keys
 */
const validateInput = (size) => {
  const errors = {};

  // variable to store valid key value
  const sizeInt = {};
  for (const key in size) {
    if (key !== "_id" && size.hasOwnProperty(key)) {
      if (isNumber(size[key]) === true) {
        // convert to floating point number
        sizeInt[key] = parseFloat(size[key]);
      } else {
        errors[key] = "Invalid input";
      }
    }
  }
  return {
    isValid: isEmpty(errors),
    errors,
    sizeInt
  };
};

/**
 * @method saveDefaultSize
 * @summary calls "shipping/size/save" method if size is a valid object
 * @param {String} shopId - current shopId
 * @param {Object} size - size to be saved
 * @since 1.5.5
 * @return {Function} callback
 */
const saveDefaultSize = (shopId, size, callback) => {
  const { isValid, sizeInt } = validateInput(size);

  if (isValid === true) {
    Meteor.call("shipping/size/save", shopId, sizeInt, (error) => {
      if (error) {
        Alerts.toast("An error occured", "error");
      } else {
        Alerts.toast("Settings saved");
      }
    });
  } else {
    Alerts.toast("Invalid inputs", "error");
  }
  return callback();
};

/**
 * @method composer
 * @summary composer
 * @param {Object} props
 * @param {Function} onData
 * @since 1.5.5
 */
const composer = (props, onData) => {
  const size = Shops.findOne({
    _id: Reaction.getShopId()
  }).defaultParcelSize;
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
