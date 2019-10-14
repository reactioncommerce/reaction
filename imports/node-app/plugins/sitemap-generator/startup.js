import generateSitemapsJob from "./jobs/generate-sitemaps-job.js";
import getSitemapRouteHandler from "./middleware/handle-sitemap-routes.js";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.app The ReactionNodeApp instance
 * @param {Object} context.collections A map of MongoDB collections
 * @returns {undefined}
 */
export default async function startup(context) {
  const { app } = context;

  // Setup sitemap generation recurring job
  await generateSitemapsJob(context);

  // Wire up a file download route
  if (app.expressApp) {
    app.expressApp.use(getSitemapRouteHandler(context));
  }
}
