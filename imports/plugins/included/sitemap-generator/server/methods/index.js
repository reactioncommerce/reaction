import Reaction from "/imports/plugins/core/core/server/Reaction";
import generateSitemaps from "../lib/generateSitemaps";

export default {

  /**
   * @name generateSitemaps
   * @summary Generates & stores sitemap documents for primary shop
   * @memberof Methods/Sitemaps
   */
  "sitemaps/generate" () {
    if (Reaction.hasAdminAccess() === false) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock();

    generateSitemaps();
  }
};
