import { WebApp } from "meteor/webapp";
import generateSitemapsJob from "./jobs/generate-sitemaps-job";
import handleSitemapRoutes from "./middleware/handle-sitemap-routes";

// Setup sitemap generation recurring job
generateSitemapsJob();

// Sitemap front-end routes
WebApp.connectHandlers.use(handleSitemapRoutes);
