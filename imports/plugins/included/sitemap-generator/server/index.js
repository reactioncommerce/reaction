import { WebApp } from "meteor/webapp";
import generateSitemapsJob from "./jobs/generate-sitemaps-job";
import handleSitemapRoutes from "./middleware/handle-sitemap-routes";

// Load translations
import "./i18n";

// Setup sitemap generation recurring job
generateSitemapsJob();

// Sitemap front-end routes
WebApp.connectHandlers.use(handleSitemapRoutes);
