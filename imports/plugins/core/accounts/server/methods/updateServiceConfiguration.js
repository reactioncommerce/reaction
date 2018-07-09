import _ from "lodash";
import { check } from "meteor/check";
import { ServiceConfiguration } from "meteor/service-configuration";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name accounts/updateServiceConfiguration
 * @memberof Accounts/Methods
 * @method
 * @example Meteor.call("accounts/updateServiceConfiguration", service, fields, (callBackFunction))
 * @summary Update service configuration
 * @param {String} service Service name
 * @param {Array} fields Fields array
 * @returns {Boolean} Upsert result or false
 */
export default function updateServiceConfiguration(service, fields) {
  check(service, String);
  check(fields, Array);
  const dataToSave = {};

  _.each(fields, (field) => {
    dataToSave[field.property] = field.value;
  });

  if (Reaction.hasPermission(["dashboard/accounts"])) {
    return ServiceConfiguration.configurations.upsert({
      service
    }, {
      $set: dataToSave
    });
  }
  return false;
}
