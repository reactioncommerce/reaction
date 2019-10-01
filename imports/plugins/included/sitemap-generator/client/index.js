import { registerBlock } from "/imports/plugins/core/components/lib";
import SitemapSettings from "./components/SitemapSettings";

registerBlock({
  region: "ShopSettings",
  name: "SitemapSettings",
  component: SitemapSettings,
  priority: 9
});
