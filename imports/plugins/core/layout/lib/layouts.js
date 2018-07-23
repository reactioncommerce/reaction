import { Importer } from "/imports/plugins/core/core/server/Reaction/importer";
import { Shops } from "/lib/collections";

export function registerLayout(layout) {
  Shops.find().forEach((shop) => {
    Importer.layout(layout, shop._id);
  });
}
