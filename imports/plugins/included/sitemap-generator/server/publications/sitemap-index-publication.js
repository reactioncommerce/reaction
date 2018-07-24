import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Sitemaps } from "../../lib/collections/sitemaps";

/**
 * @name sitemapIndexPublication
 * @summary Meteor publication handler for subscribing to the sitemap index document
 * @returns {Cursor} Sitemaps collection cursor
 */
export default function sitemapIndexPublication() {
  return Sitemaps.find({
    shopId: Reaction.getPrimaryShopId(),
    handle: "sitemap.xml"
  });
}
