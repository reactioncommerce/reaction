import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Job } from "meteor/vsivsi:job-collection";
import { Packages } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import { Logger, Reaction } from "/server/api";

function fieldsChanged(changedFields) {
  for (const field of changedFields) {
    if (field.indexOf("includes")) {
      return true;
    }
  }
  return false;
}

function weightsChanged(changedFields) {
  for (const field of changedFields) {
    if (field.indexOf("weights")) {
      return true;
    }
  }
  return false;
}

Meteor.methods({
  "search/updateSearchSettings": function (modifier, _id) {
    check(modifier, Match.Optional(Schemas.CorePackageConfig));
    check(_id, String);
    const currentSettings = Packages.findOne(_id);
    const newSettingsArray = _.keys(modifier.$set);
    const changedSettings = [];
    for (const setting of newSettingsArray) {
      const currentSetting = _.get(currentSettings, setting);
      if (currentSetting !== modifier.$set[setting]) {
        changedSettings.push(setting);
      }
    }
    Logger.info("Changed settings: ", changedSettings);
    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    if (fieldsChanged(changedSettings)) {
      Logger.info("Fields have changed, we need to rebuild the ProductSearch Collection");
      // fields have changed, we need to rebuild entire Product Search Collection
    } else if (weightsChanged(changedSettings)) {
      // only weights have changed, we only need to build the index
      Logger.info("Weights have changed, we need to rebuild the ProductSearch index");
    }
    // Logger.info("Existing settings");
    // Logger.info(JSON.stringify(currentSettings.settings, null, 4));
    // // we should run new job on every form change, even if not all of them will
    // // change currencyRate job
    // const fetchCurrencyRatesJob = new Job(Collections.Jobs, "shop/fetchCurrencyRates", {})
    //   .priority("normal")
    //   .retry({
    //     retries: 5,
    //     wait: 60000,
    //     backoff: "exponential" // delay by twice as long for each subsequent retry
    //   })
    //   .repeat({
    //     // wait: refreshPeriod * 60 * 1000
    //     schedule: Collections.Jobs.later.parse.text(refreshPeriod)
    //   })
    //   .save({
    //     // Cancel any jobs of the same type,
    //     // but only if this job repeats forever.
    //     cancelRepeats: true
    //   });

    Packages.update(_id, modifier);
    // return fetchCurrencyRatesJob;
  }
});
