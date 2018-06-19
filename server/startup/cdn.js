import { Meteor } from "meteor/meteor";

/**
 * Sets prefix for the user who wants to serve bundled js and css
 * files from different URL
 *
 * @return {null} null
 */
export default function setupCdn() {
  if (Meteor.settings.cdnPrefix) {
    Meteor.startup(() => WebAppInternals.setBundledJsCssPrefix(Meteor.settings.cdnPrefix)); // eslint-disable-line no-undef
  }
}
