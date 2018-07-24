import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { Sitemaps } from "../lib/collections/sitemaps";
import generateSitemapsJob from "./jobs/generate-sitemaps-job";
import handleSitemapRoutes from "./middleware/handle-sitemap-routes";
import methods from "./methods";
import sitemapIndexPublication from "./publications/sitemap-index-publication";

// Load translations
import "./i18n";

// Create a compound index to support queries by shopId or shopId & handle
Sitemaps.rawCollection().createIndex({ shopId: 1, handle: 1 }, { background: true });

// Setup sitemap generation recurring job
generateSitemapsJob();

// Sitemap front-end routes
WebApp.connectHandlers.use(handleSitemapRoutes);

// Init methods
Meteor.methods(methods);

// Init publications
Meteor.publish("sitemaps/index", sitemapIndexPublication);
