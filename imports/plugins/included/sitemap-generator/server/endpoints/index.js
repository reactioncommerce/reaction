import { WebApp } from "meteor/webapp";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getSitemapXML from "../lib/getSitemapXML";

/**
 * Route handler for generated sitemap XML files
 */
WebApp.connectHandlers.use((req, res, next) => {
  if (req.originalUrl.startsWith("/sitemap") === false) {
    next();
  } else {
    // Load and serve sitemap's XML
    res.setHeader("Content-Type", "text/xml");

    const shopId = Reaction.getPrimaryShopId();
    const handle = req.originalUrl.replace("/", "");
    const xml = getSitemapXML(shopId, handle);

    if (xml) {
      res.statusCode = 200;
      res.send(xml);
    } else {
      res.statusCode = 404;
    }

    res.end();
  }
});
