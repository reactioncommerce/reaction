import Reaction from "/imports/plugins/core/core/server/Reaction";
import getSitemapXML from "../lib/get-sitemap-xml";

/**
 * @name handleSitemapRoutes
 * @summary Route handler/middleware for generated sitemap XML files
 * @param {Object} req - Node.js IncomingMessage object
 * @param {Object} res - Node.js ServerResponse object
 * @param {Function} next - Passes handling of request to next relevant middlewhere
 * @returns {undefined} - Sends XML to response, or triggers 404
 */
export default function handleSitemapRoutes(req, res, next) {
  if (req.originalUrl.startsWith("/sitemap") === false) {
    next();
    return;
  }

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
