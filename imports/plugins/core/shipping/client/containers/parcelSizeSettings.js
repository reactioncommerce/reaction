import { Meteor } from "meteor/meteor";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction, i18next, Logger } from "/client/api/";
import { Shops } from "/lib/collections";
import { ShippingParcel } from "/lib/collections/schemas";
import ParcelSizeSettings from "../components/parcelSizeSettings";

/**
 * @method saveDefaultSize
 * @summary call "shop/updateDefaultParcelSize" method
 * @param {Object} size - size object to be saved
 * @since 1.1.12
 * @returns {Function} callback
*/
const saveDefaultSize = (size) => {
  const parcel = ShippingParcel.clean(size);
  try {
    ShippingParcel.validate(parcel);
  } catch (error) {
    Logger.error(error);
    Alerts.toast(i18next.t("shippingSettings.parcelSize.saveFailed"), "error");
    return;
  }
  Meteor.call("shop/updateDefaultParcelSize", parcel, (error) => {
    if (error) {
      Alerts.toast(i18next.t("shippingSettings.parcelSize.saveFailed"), "error");
    }
  });
};

/**
 * @method onCardExpand
 * @summary set "edit/focus" in current Reaction state
 * @param {String} cardName - card name to be set
 * @since 1.1.12
 * @returns {Function} callback
*/
const onCardExpand = (cardName) => {
  Reaction.state.set("edit/focus", cardName);
};

/**
 * @method getEditFocus
 * @summary get "edit/focus" value from current Reaction state
 * @since 1.1.12
 * @returns {String} focus value
*/
const getEditFocus = () => Reaction.state.get("edit/focus");

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
const composer = (props, onData) => {
  const shop = Shops.findOne({
    _id: Reaction.getShopId()
  });
  const doc = shop.defaultParcelSize;
  const formSettings = {
    shownFields: {
      weight: ShippingParcel._schema.weight,
      length: ShippingParcel._schema.length,
      width: ShippingParcel._schema.width,
      height: ShippingParcel._schema.height
    },
    hiddenFields: [
      "container"
    ],
    fieldsProp: {
      weight: {
        renderComponent: "string",
        inputType: "number"
      },
      length: {
        renderComponent: "string",
        inputType: "number"
      },
      width: {
        renderComponent: "string",
        inputType: "number"
      },
      height: {
        renderComponent: "string",
        inputType: "number"
      }
    }
  };

  onData(null, {
    getEditFocus,
    onCardExpand,
    doc,
    ...formSettings,
    saveDefaultSize
  });
};

registerComponent("ParcelSizeSettings", ParcelSizeSettings, composeWithTracker(composer));

export default composeWithTracker(composer)(ParcelSizeSettings);
