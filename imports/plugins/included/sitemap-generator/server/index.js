import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import generateSitemapsJob from "./jobs/generate-sitemaps-job";
import handleSitemapRoutes from "./middleware/handle-sitemap-routes";
import methods from "./methods";
import "./i18n";

generateSitemapsJob();

WebApp.connectHandlers.use(handleSitemapRoutes);

Meteor.methods(methods);
