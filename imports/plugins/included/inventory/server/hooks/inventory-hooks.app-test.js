/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { Inventory, Orders }  from "/lib/collections";
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
    sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function () {
      check(arguments, [Match.Any]);
      return true;
    });
    sandbox.stub(Reaction, "hasPermission", () => true);
    const cart = Factory.create("cartOne");
    sandbox.stub(Reaction, "getShopId", function () {
      return cart.shopId;
    });
    let shop = getShop();
    let product = cart.items[0];
    const inventoryItem = Inventory.findOne({
      productId: product.productId,
      variantId: product.variants._id,
      shopId: shop._id
    });
    expect(inventoryItem).to.not.be.undefined;
    // because the cart fixture does not trigger hooks we need to allocate inventory manuall
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

  it("should move allocated inventory to 'shipped' when an order is shipped", function (done) {
    sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function () {
      check(arguments, [Match.Any]);
      return true;
    });
    sandbox.stub(Reaction, "hasPermission", () => true);
    const cart = Factory.create("cartOne");
    sandbox.stub(Reaction, "getShopId", function () {
      return cart.shopId;
    });
    let shop = getShop();
    let product = cart.items[0];
    const inventoryItem = Inventory.findOne({
      productId: product.productId,
      variantId: product.variants._id,
      shopId: shop._id
    });
    expect(inventoryItem).to.not.be.undefined;
    // because the cart fixture does not trigger hooks we need to allocate inventory manuall
    Inventory.update(inventoryItem._id,
      {
        $set: {
          "workflow.status": "reserved",
          "orderItemId": product._id
        }
      });
    spyOnMethod("copyCartToOrder", cart.userId);
    const orderId = Meteor.call("cart/copyCartToOrder", cart._id);
    const order = Orders.findOne(orderId);
    const shipping = { items: [] };
    Meteor.call("orders/shipmentShipped", order, shipping, () => {
      Meteor._sleepForMs(500);
      const shippedInventoryItem = Inventory.findOne(inventoryItem._id);
      expect(shippedInventoryItem.workflow.status).to.equal("shipped");
      return done();
    });
  });
});
