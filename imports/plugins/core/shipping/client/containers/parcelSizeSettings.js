import { Meteor } from "meteor/meteor";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction, i18next } from "/client/api/";
import { Shops } from "/lib/collections";
import { ShippingParcel } from "/lib/collections/schemas";
import { convertWeight, convertLength } from "/lib/api";
import ParcelSizeSettings from "../components/parcelSizeSettings";

/**
 * @method saveDefaultSize
 * @summary call "shipping/updateParcelSize" method
 * @param {Object} size - size object to be saved
 * @since 2.0.0
 * @return {Function} callback
*/
const saveDefaultSize = (size) => {
  const parcel = ShippingParcel.clean(size);
  Object.keys(parcel).forEach((key) => {
    parcel[key] = Number(parcel[key]);
  });
  try {
    ShippingParcel.validate(parcel);
  } catch (error) {
    return;
  }
  Meteor.call("shipping/updateParcelSize", parcel, (error) => {
    if (error) {
      Alerts.toast(i18next.t("shippingSettings.parcelSize.saveFailed"), "error");
    }
  });
};

/**
 * @method onCardExpand
 * @summary set "edit/focus" in current Reaction state
 * @param {String} cardName - card name to be set
 * @since 2.0.0
 * @return {Function} callback
*/
const onCardExpand = (cardName) => {
  Reaction.state.set("edit/focus", cardName);
};

/**
 * @method getEditFocus
 * @summary get "edit/focus" value from current Reaction state
 * @since 2.0.0
*/
const getEditFocus = () => Reaction.state.get("edit/focus");

/**
 * @method composer
 * @summary composer - reactive Tracker wrapped function
 * @param {Object} props
 * @param {Function} onData
 * @since 2.0.0
*/
const composer = (props, onData) => {
  const shop = Shops.findOne({
    _id: Reaction.getShopId()
  });
  const { baseUOM, baseUOL } = shop;
  let doc = shop.defaultParcelSize;
  if (!doc) {
    doc = {
      weight: convertWeight("lb", baseUOM, 8),
      height: convertLength("in", baseUOL, 6),
      length: convertLength("in", baseUOL, 11.25),
      width: convertLength("in", baseUOL, 8.75)
    };
  }
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
