import { check } from "meteor/check";
import { Shops } from "/lib/collections";

/**
 * @name shop/changeLayout
 * @method
 * @memberof Shop/Methods
 * @summary Change the layout for all workflows so you can use a custom one
 * @param {String} shopId - the shop's ID
 * @param {String} newLayout - new layout to use
 * @return {Number} mongo update result
 */
export default function changeLayouts(shopId, newLayout) {
  check(shopId, String);
  check(newLayout, String);
  const shop = Shops.findOne(shopId);
  for (let index = 0; index < shop.layout.length; index += 1) {
    shop.layout[index].layout = newLayout;
  }
  return Shops.update(shopId, {
    $set: { layout: shop.layout }
  });
}
