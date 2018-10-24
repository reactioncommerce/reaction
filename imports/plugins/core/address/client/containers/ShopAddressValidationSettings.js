import { get } from "lodash";
import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { Countries } from "/client/collections";
import Logger from "/client/modules/logger";
import { Packages } from "/lib/collections";
import ShopAddressValidationSettings from "../components/ShopAddressValidationSettings";

const PACKAGE_NAME = "reaction-address";

/**
 *
 */
function getEnabledAddressValidationServices() {
  // Get plugin settings for the current shop
  const plugin = Packages.findOne({ name: PACKAGE_NAME, shopId: Reaction.getShopId() });
  if (!plugin) return [];

  return get(plugin, "settings.addressValidation.enabledServices", []);
}

/**
 *
 */
function updateEnabledServices(enabledServices) {
  return new Promise((resolve, reject) => {
    Meteor.call("package/update", PACKAGE_NAME, "settings.addressValidation.enabledServices", enabledServices, (error, result) => {
      if (error) {
        Logger.error(error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

const handlers = {
  onItemAdded(doc) {
    const enabledServices = getEnabledAddressValidationServices();
    enabledServices.push({ ...doc, _id: Random.id() });
    return updateEnabledServices(enabledServices);
  },
  onItemDeleted(id) {
    let enabledServices = getEnabledAddressValidationServices();
    enabledServices = enabledServices.filter((item) => item._id !== id);
    return updateEnabledServices(enabledServices);
  },
  onItemEdited(id, doc) {
    let enabledServices = getEnabledAddressValidationServices();
    enabledServices = enabledServices.map((item) => {
      if (item._id === id) return { ...item, ...doc };
      return item;
    });
    return updateEnabledServices(enabledServices);
  }
};

const composer = (props, onData) => {
  let enabledServices = getEnabledAddressValidationServices();

  // Add serviceDisplayName to each item
  if (Array.isArray(enabledServices)) {
    enabledServices = enabledServices.map((item) => {
      const serviceDisplayName = "TODO Get Names";
      return {
        serviceDisplayName,
        ...item
      };
    });
  }

  onData(null, {
    enabledServices,
    countryOptions: Countries.find().fetch(),
    serviceOptions: [{
      label: "Test",
      value: "test"
    }]
  });
};

registerComponent("ShopAddressValidationSettings", ShopAddressValidationSettings, [
  withProps(handlers),
  composeWithTracker(composer)
]);

export default compose(
  withProps(handlers),
  composeWithTracker(composer)
)(ShopAddressValidationSettings);
