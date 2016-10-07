import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Job } from "meteor/vsivsi:job-collection";
import { Packages, Jobs } from "/lib/collections";
import { CorePackageConfig } from "/lib/collections/schemas";
import { Logger, Reaction } from "/server/api";


function fieldsChanged(changedFields, fieldType = "includes") {
  for (const field of changedFields) {
    if (field.indexOf(fieldType) !== -1) {
      return true;
    }
  }
  return false;
}

function weightsChanged(changedFields) {
  return fieldsChanged(changedFields, "weights");
}

Meteor.methods({
  "search/updateSearchSettings": function (modifier, _id) {
    check(modifier, Match.Optional(CorePackageConfig));
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
    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    let rebuildJob;
    if (fieldsChanged(changedSettings)) {
      Logger.info("Fields have changed, we need to rebuild the ProductSearch Collection");
      // fields have changed, we need to rebuild entire Product Search Collection
      rebuildJob = new Job(Jobs, "product/buildSearchCollection", {})
        .priority("normal")
        .retry({
          retries: 5,
          wait: 60000,
          backoff: "exponential" // delay by twice as long for each subsequent retry
        })
        .save({
          // Cancel any jobs of the same type,
          // but only if this job repeats forever.
          cancelRepeats: true
        });
    } else if (weightsChanged(changedSettings)) {
      // only weights have changed, we only need to build the index
      Logger.info("Weights have changed, we need to rebuild the ProductSearch index");
      rebuildJob = new Job(Jobs, "product/buildSearchIndex", {})
        .priority("normal")
        .retry({
          retries: 5,
          wait: 60000,
          backoff: "exponential"
        })
        .save({
          // Cancel any jobs of the same type,
          // but only if this job repeats forever.
          cancelRepeats: true
        });
    }
    Packages.update(_id, modifier);
    return rebuildJob;
  }
});
