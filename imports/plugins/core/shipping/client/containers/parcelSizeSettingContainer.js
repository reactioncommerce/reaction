import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Validation } from "@reactioncommerce/reaction-collections";
import { Reaction, i18next } from "/client/api/";
import { Shops } from "/lib/collections";
import { ParcelSize } from "../../lib/collections/schema";
import ParcelSizeSettings from "../components/parcelSizeSettings";

/**
 * @method validation
 * @summary create a validation context for size object
 * @since 1.6.1
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
 * @since 1.6.1
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
 * @method onCardExpand
 * @summary set "edit/focus" in current Reaction state
 * @param {String} cardName - card name to be set
 * @since 1.6.1
 * @return {Function} callback
*/
const onCardExpand = (cardName) => {
  Reaction.state.set("edit/focus", cardName);
};

/**
 * @method getEditFocus
 * @summary get "edit/focus" value from current Reaction state
 * @since 1.6.3
*/
const getEditFocus = () => {
  return Reaction.state.get("edit/focus");
};

/**
 * @method composer
 * @summary composer - reactive Tracker wrapped function
 * @param {Object} props
 * @param {Function} onData
 * @since 1.6.3
*/
const composer = (props, onData) => {
  const size = Shops.findOne({
    _id: Reaction.getShopId()
  }).defaultParcelSize;
  onData(null, {
    getEditFocus,
    onCardExpand,
    size,
    saveDefaultSize,
    validation
  });
};

registerComponent("ParcelSizeSettings", ParcelSizeSettings, [
  composeWithTracker(composer)
]);

export default compose(
  composeWithTracker(composer)
)(ParcelSizeSettings);
