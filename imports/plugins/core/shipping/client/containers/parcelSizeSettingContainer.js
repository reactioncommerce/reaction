import { Meteor } from "meteor/meteor";
import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Validation } from "@reactioncommerce/reaction-collections";
import { Reaction, i18next } from "/client/api/";
import { Shops } from "/lib/collections";
import { ParcelSize } from "../../lib/collections/schema";
import ParcelSizeSettings from "../components/parcelSizeSettings";

/**
 * @method validation
 * @summary create a validation context for size object
 * @since 1.5.5
 * @return {Function} - return a new instance of Validation using ParcelSize schema
*/
const validation = () => {
  return new Validation(ParcelSize);
};

/**
 * @method saveDefaultSize
 * @summary call "shipping/updateParcelSize" method
 * @param {String} shopId - current shopId
 * @param {Object} size - size object to be saved
 * @param {Function} callback - callback
 * @since 1.5.5
 * @return {Function} callback
*/
const saveDefaultSize = (shopId, size, callback) => {
  Meteor.call("shipping/updateParcelSize", shopId, size, (error) => {
    if (error) {
      Alerts.toast(i18next.t("shippingSettings.parcelSize.saveFailed"),
        "error");
    } else {
      Alerts.toast(i18next.t("shippingSettings.parcelSize.saveSuccess"), "success");
    }
  });
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
    saveDefaultSize,
    validation
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
