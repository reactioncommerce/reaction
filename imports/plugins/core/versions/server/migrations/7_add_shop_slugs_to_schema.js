import { Migrations } from "meteor/percolate:migrations";
import { Shops } from "/lib/collections";
import { getSlug } from "/lib/api";

Migrations.add({
  version: 7,
  up() {
    // Get all shops
    const shops = Shops.find();
    // Get primary shop
    const primaryShop = Shops.findOne({ shopType: "primary" });
    // Init list of merchant shops
    const merchantShops = [];

    // Loop through all shops creating slugs and creating merchant shop objects
    shops.forEach((shop) => {
      // create slug from shop name
      const shopSlug = getSlug(shop.name);

      // If a shop doesn't have a slug, add one
      if (typeof shop.slug === "undefined") {
        Shops.update({ _id: shop._id }, {
          $set: {
            slug: shopSlug
          }
        }, { bypassCollection2: true });
      }

      // if the shop is a merchant shop, create an obeject for it to - these will be used to create shop routes
      if (shop.shopType === "merchant") {
        merchantShops.push({
          _id: shop._id,
          name: shop.name,
          slug: shopSlug
        });
      }
    });

    // if we added any merchant shops, add those to the primary shop
    if (merchantShops.length > 0) {
      Shops.update({ _id: primaryShop._id }, {
        $set: {
          merchantShops
        }
      }, { bypassCollection2: true });
    }
  },

  down() {
    // Remove slugs and merchant shops
    Shops.update({}, {
      $unset: {
        slug: null,
        merchantShops: null
      }
    }, { bypassCollection2: true, multi: true });
  }
});
