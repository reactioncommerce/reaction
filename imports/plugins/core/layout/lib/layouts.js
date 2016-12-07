import { Import } from "/server/api/core/import";

export function registerLayout(layout) {
  Shops.find().forEach((shop) => {
    Import.layout(layout, shop._id);
  });
}
