/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { Inventory, Cart }  from "/lib/collections";
import { Reaction } from "/server/api";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Fixtures from "/server/imports/fixtures";
import { getShop } from "/server/imports/fixtures/shops";

Fixtures();

describe("Inventory Hooks", function () {
  let originals;
  let sandbox;

  before(function () {
    originals = {
      mergeCart: Meteor.server.method_handlers["cart/mergeCart"],
      createCart: Meteor.server.method_handlers["cart/createCart"],
      copyCartToOrder: Meteor.server.method_handlers["cart/copyCartToOrder"],
      addToCart: Meteor.server.method_handlers["cart/addToCart"],
      setShipmentAddress: Meteor.server.method_handlers["cart/setShipmentAddress"],
      setPaymentAddress: Meteor.server.method_handlers["cart/setPaymentAddress"]
    };
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `cart/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return originals[method].apply(this, arguments);
    });
  }

  it("should move allocated inventory to 'sold' when an order is created", function () {
    this.timeout(50000);
    Inventory.direct.remove({});
    Inventory.remove({});
    Cart.remove();
    const cart = Factory.create("cartToOrder");
    sandbox.stub(Reaction, "getShopId", function () {
      return cart.shopId;
    });
    sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function () {
      check(arguments, [Match.Any]);
    });
    let shop = getShop();
    let product = cart.items[0];
    const inventoryItem = Inventory.insert({
      productId: product.productId,
      variantId: product.variants._id,
      shopId: shop._id,
      workflow: {
        status: "reserved"
      },
      orderItemId: product._id
    });
    expect(inventoryItem).to.not.be.undefined;
    Inventory.update(inventoryItem._id,
      {
        $set: {
          "workflow.status": "reserved",
          "orderItemId": product._id
        }
      });
    spyOnMethod("copyCartToOrder", cart.userId);
    Meteor.call("cart/copyCartToOrder", cart._id);
    let updatedInventoryItem = Inventory.findOne({
      productId: product.productId,
      variantId: product.variants._id,
      shopId: shop._id,
      orderItemId: product._id
    });
    expect(updatedInventoryItem.workflow.status).to.equal("sold");
  });
});
