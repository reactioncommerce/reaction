import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import generateSitemapsJob from "./jobs/generateSitemapsJob";
import handleSitemapRoutes from "./middleware/handleSitemapRoutes";
import methods from "./methods";
import "./i18n";

generateSitemapsJob();

WebApp.connectHandlers.use(handleSitemapRoutes);

Meteor.methods(methods);
