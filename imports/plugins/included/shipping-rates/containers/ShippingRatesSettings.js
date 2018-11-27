import { Meteor } from "meteor/meteor";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Shipping } from "/lib/collections";
import ShippingRatesSettings from "../components/ShippingRatesSettings";

/**
 * @param {Object} props Props from parent
 * @param {Function} onData Callback
 * @returns {undefined}
 */
function composer(props, onData) {
  Meteor.subscribe("Shipping");

  const shippingDoc = Shipping.findOne({ "provider.name": "flatRates" });

  onData(null, {
    fulfillmentMethods: shippingDoc ? shippingDoc.methods : null
  });
}

registerComponent("ShippingRatesSettings", ShippingRatesSettings, composeWithTracker(composer));

export default composeWithTracker(composer)(ShippingRatesSettings);
