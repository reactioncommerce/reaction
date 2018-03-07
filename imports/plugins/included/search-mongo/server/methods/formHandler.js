import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Packages, Jobs } from "/lib/collections";
import { SearchPackageConfig } from "../../lib/collections/schemas";
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
  /**
   * @name search/updateSearchSettings
   * @method
   * @param  {Object} details An object with _id and modifier props
   * @param  {String} [docId] DEPRECATED. The _id, if details is the modifier.
   */
  "search/updateSearchSettings"(details, docId) {
    check(details, Object);

    // Backward compatibility
    check(docId, Match.Optional(String));
    const id = docId || details._id;
    const modifier = docId ? details : details.modifier;

    check(id, String);
    SearchPackageConfig.validate(modifier, { modifier: true });

    const currentSettings = Packages.findOne(id);
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
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    let rebuildJob;
    if (fieldsChanged(changedSettings)) {
      Logger.debug("Fields have changed, we need to rebuild the ProductSearch Collection");
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
      Logger.debug("Weights have changed, we need to rebuild the ProductSearch index");
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
    Packages.update(id, modifier);
    return rebuildJob;
  }
});
