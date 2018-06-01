import { Importer } from "/server/api/core/importer";
import { Shops } from "/lib/collections";

export function registerLayout(layout) {
  Shops.find().forEach((shop) => {
    Importer.layout(layout, shop._id);
  });
}
