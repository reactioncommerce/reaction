import { Meteor } from "meteor/meteor";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Jobs } from "/lib/collections";
import { Job } from "/imports/plugins/core/job-collection/lib";

export default {

  /**
   * @name sitemaps/generate
   * @summary Generates & stores sitemap documents for primary shop
   * @memberof Methods/Sitemaps
   * @returns {undefined}
   */
  "sitemaps/generate"() {
    if (Reaction.hasAdminAccess() === false) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock();

    new Job(Jobs, "sitemaps/generate", {}).save({ cancelRepeats: true });
  }
};
