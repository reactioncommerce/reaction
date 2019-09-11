import { WebApp } from "meteor/webapp";
import handleSitemapRoutes from "./middleware/handle-sitemap-routes";

// Sitemap front-end routes
WebApp.connectHandlers.use(handleSitemapRoutes);
