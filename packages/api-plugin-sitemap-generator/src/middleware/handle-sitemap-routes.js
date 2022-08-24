import getSitemapXML from "../util/get-sitemap-xml.js";

/**
 * @name getSitemapRouteHandler
 * @summary Returns a route handler/middleware for generated sitemap XML files
 * @param {Object} context App context
 * @returns {Function} Handler function
 */
export default function getSitemapRouteHandler(context) {
  const { collections: { Shops } } = context;

  /**
   * @name handleSitemapRoutes
   * @summary Route handler/middleware for generated sitemap XML files
   * @param {Object} req - Node.js IncomingMessage object
   * @param {Object} res - Node.js ServerResponse object
   * @param {Function} next - Passes handling of request to next relevant middleware
   * @returns {undefined} - Sends XML to response, or triggers 404
   */
  async function handleSitemapRoutes(req, res, next) {
    if (req.originalUrl.startsWith("/sitemap") === false) {
      next();
      return;
    }

    const primaryShop = await Shops.findOne({ shopType: "primary" });
    if (!primaryShop) {
      res.statusCode = 404;
      res.end();
      return;
    }

    const handle = req.originalUrl.replace("/", "");
    const xml = await getSitemapXML(context, primaryShop._id, handle);

    // Load and serve sitemap's XML
    res.setHeader("Content-Type", "text/xml");

    if (xml) {
      res.statusCode = 200;
      res.end(xml);
    } else {
      res.statusCode = 404;
      res.end();
    }
  }

  return handleSitemapRoutes;
}
