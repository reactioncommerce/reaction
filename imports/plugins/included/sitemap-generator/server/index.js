import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import handleSitemapRoutes from "./middleware/handleSitemapRoutes";
import methods from "./methods";
import "./i18n";

WebApp.connectHandlers.use(handleSitemapRoutes);
Meteor.methods(methods);
