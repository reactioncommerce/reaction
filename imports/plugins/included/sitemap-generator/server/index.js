import { WebApp } from "meteor/webapp";
import handleSitemapRoutes from "./middleware/handle-sitemap-routes";

// Load translations
import "./i18n";

// Sitemap front-end routes
WebApp.connectHandlers.use(handleSitemapRoutes);
