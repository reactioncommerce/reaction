/**
 * @name Query.siteVerificationToken
 * @method
 * @memberof GoogleWebToolsSettimgs/GraphQL
 * @summary Gets the site verification token
 * @param {Object} _ - unused
 * @param {Object} __ - unused
 * @param {Object} context an object containing the pre-request state
 * @return {String} Radial public key
 */
export default async function siteVerificationToken(_, __, context) {
  const pkg = await context.collections.Packages.findOne({
    "name": "google-webtools",
    "settings.enabled": true
  });
  try {
    const { settings: { public: { siteVerificationToken } } } = pkg;
    return siteVerificationTokenn;
  } catch (error) {
    return "";
  }
}
