import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { check } from "meteor/check";
import { ServiceConfiguration } from "meteor/service-configuration";
import { Packages } from "/lib/collections";
import { EJSON } from "meteor/ejson";

/**
 * @method loadSettings
 * @summary
 * This basically allows you to "hardcode" all the settings. You can change them
 * via admin etc for the session, but when the server restarts they'll
 * be restored back to the supplied json
 *
 * All settings are private unless added to `settings.public`
 *
 * Meteor account services can be added in `settings.services`
 * @memberof Core
 * @param {Object} json - json object to insert
 * @returns {Boolean} boolean -  returns true on insert
 * @example
 *  ReactionRegistry.loadSettings Assets.getText("settings/reaction.json")
 */
export default function loadSettings(json) {
  check(json, String);
  let exists;
  let service;
  let services;
  let settings;
  const validatedJson = EJSON.parse(json);

  // validate json and error out if not an array
  if (!_.isArray(validatedJson[0])) {
    Logger.warn("Load Settings is not an array. Failed to load settings.");
    return false;
  }

  let result;
  // loop settings and upsert packages.
  for (const pkg of validatedJson) {
    for (const item of pkg) {
      exists = Packages.findOne({
        name: item.name
      });

      // insert into the Packages collection
      if (exists) {
        result = Packages.upsert({
          name: item.name
        }, {
          $set: {
            settings: item.settings,
            enabled: item.enabled
          }
        }, {
          multi: true,
          upsert: true,
          validate: false
        });
      }
      // sets the private settings of various
      // accounts authentication services
      if (item.settings.services) {
        for (services of item.settings.services) {
          for (service in services) {
            // actual settings for the service
            if ({}.hasOwnProperty.call(services, service)) {
              settings = services[service];
              ServiceConfiguration.configurations.upsert({
                service
              }, {
                $set: settings
              });
              Logger.debug(`service configuration loaded: ${item.name} | ${service}`);
            }
          }
        }
      }
      Logger.debug(`loaded local package data: ${item.name}`);
    }
  }
  return result;
}
