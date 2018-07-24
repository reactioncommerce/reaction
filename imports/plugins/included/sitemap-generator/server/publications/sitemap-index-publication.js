import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Sitemaps } from "../../lib/collections/sitemaps";

export default function sitemapIndexPublication() {
  return Sitemaps.find({
    shopId: Reaction.getPrimaryShopId(),
    handle: "sitemap.xml"
  });
}
