import { get, sortBy } from "lodash";
import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { Countries } from "/client/collections";
import Logger from "/client/modules/logger";
import { Packages } from "/lib/collections";
import ShopAddressValidationSettings from "../components/ShopAddressValidationSettings";
import withAddressValidationServices from "../hoc/withAddressValidationServices";

const PACKAGE_NAME = "reaction-address";

/**
 * @returns {Object[]} The list of enabled address validation services
 *   for the current shop, from package settings, with each item having
 *   `_id`, `createdAt`, `countryCodes`, and `serviceName` props
 */
function getEnabledAddressValidationServices() {
  // Get plugin settings for the current shop
  const plugin = Packages.findOne({ name: PACKAGE_NAME, shopId: Reaction.getShopId() });
  if (!plugin) return [];

  return sortBy(get(plugin, "settings.addressValidation.enabledServices", []), "createdAt");
}

/**
 * @param {Object[]} enabledServices Updated `enabledServices` array, to store in
 *   package settings
 * @returns {Promise<Object>} Method result
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
    enabledServices.push({ ...doc, _id: Random.id(), createdAt: new Date() });
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
  const { addressValidationServices } = props;

  let enabledServices = getEnabledAddressValidationServices();

  // Add serviceDisplayName to each item
  if (Array.isArray(enabledServices)) {
    enabledServices = enabledServices.map((item) => {
      const serviceDefinition = (addressValidationServices || []).find(({ name }) => name === item.serviceName);

      let serviceDisplayName;
      if (serviceDefinition) {
        serviceDisplayName = serviceDefinition.displayName;
      } else {
        // There could be services enabled that have since had their plugins removed
        serviceDisplayName = item.serviceName;
      }

      return {
        serviceDisplayName,
        ...item
      };
    });
  }

  onData(null, {
    addressValidationServices,
    enabledServices,
    countryOptions: Countries.find().fetch()
  });
};

registerComponent("ShopAddressValidationSettings", ShopAddressValidationSettings, [
  withProps(handlers),
  withAddressValidationServices,
  composeWithTracker(composer)
]);

export default compose(
  withProps(handlers),
  withAddressValidationServices,
  composeWithTracker(composer)
)(ShopAddressValidationSettings);
