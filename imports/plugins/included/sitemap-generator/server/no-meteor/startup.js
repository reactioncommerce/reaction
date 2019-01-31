/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default function startup(context) {
  context.collections.Sitemaps = context.app.db.collection("Sitemaps");
}
