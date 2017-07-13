import { Import } from "/server/api/core/import";
import { Shops } from "/lib/collections";

export function registerLayout(layout) {
  Shops.find().forEach((shop) => {
    Import.layout(layout, shop._id);
  });
}
