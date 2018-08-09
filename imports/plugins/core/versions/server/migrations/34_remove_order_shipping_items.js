import { Migrations } from "meteor/percolate:migrations";
import { Orders } from "/lib/collections";

/**
 * Going up, migrates order.shipping.$.items -> order.shipping.$.itemIds.
 * Going down, migrates order.shipping.$.itemIds -> order.shipping.$.items
 */

Migrations.add({
  version: 34,
  up() {
    Orders.find({}).forEach((order) => {
      const shipping = (order.shipping || []).map((group) => {
        const itemIds = (group.items || []).map((item) => item._id);
        const newGroup = {
          ...group,
          itemIds
        };
        delete newGroup.items;
        return newGroup;
      });

      Orders.update({ _id: order._id }, {
        $set: {
          shipping
        }
      }, { bypassCollection2: true });
    });
  },
  down() {
    Orders.find({}).forEach((order) => {
      const shipping = (order.shipping || []).map((group) => {
        const items = (group.itemIds || []).map((itemId) => {
          const item = order.items.find((orderItem) => orderItem._id === itemId);
          return {
            _id: item._id,
            productId: item.productId,
            quantity: item.quantity,
            shopId: item.shopId,
            variantId: item.variantId
          };
        });
        const newGroup = {
          ...group,
          items
        };
        delete newGroup.itemIds;
        return newGroup;
      });

      Orders.update({ _id: order._id }, {
        $set: {
          shipping
        }
      }, { bypassCollection2: true });
    });
  }
});
