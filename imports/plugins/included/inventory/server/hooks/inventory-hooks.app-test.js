/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { Inventory, Orders, Products }  from "/lib/collections";
import { Reaction } from "/server/api";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Fixtures from "/server/imports/fixtures";
import { createCart } from "/server/imports/fixtures/cart";
import { addProductSingleVariant } from "/server/imports/fixtures/products";
import { registerInventory } from "../methods/inventory";

Fixtures();


function resetInventory() {
  Inventory.remove({});
  const products = Products.find().fetch();
  for (const product of products) {
    registerInventory(product);
  }
}

describe("Inventory Hooks", function () {
  this.timeout(50000);
  let originals;
  let sandbox;
  let cart;

  before(function () {
    originals = {
      copyCartToOrder: Meteor.server.method_handlers["cart/copyCartToOrder"]
    };
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    Products.direct.remove({});
    const { product, variant } = addProductSingleVariant();
    cart = createCart(product._id, variant._id);
    resetInventory();
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
    sandbox.stub(Reaction, "getShopId", function () {
      return cart.shopId;
    });
    const product = cart.items[0];
    const inventoryItem = Inventory.findOne({
      productId: product.productId,
      variantId: product.variants._id,
      shopId: cart.shopId
    });
    expect(inventoryItem).to.not.be.undefined;
    // because the cart fixture does not trigger hooks we need to allocate inventory manually
    Inventory.update(inventoryItem._id,
      {
        $set: {
          "workflow.status": "reserved",
          "orderItemId": product._id
        }
      });
    spyOnMethod("copyCartToOrder", cart.userId);
    Meteor.call("cart/copyCartToOrder", cart._id);
    const updatedInventoryItem = Inventory.findOne({
      productId: product.productId,
      variantId: product.variants._id,
      shopId: cart.shopId,
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
    sandbox.stub(Reaction, "getShopId", function () {
      return cart.shopId;
    });
    const cartProduct = cart.items[0];
    const inventoryItem = Inventory.findOne({
      productId: cartProduct.productId,
      variantId: cartProduct.variants._id,
      shopId: cart.shopId
    });
    expect(inventoryItem).to.not.be.undefined;
    // because the cart fixture does not trigger hooks we need to allocate inventory manuall
    Inventory.update(inventoryItem._id,
      {
        $set: {
          "workflow.status": "reserved",
          "orderItemId": cartProduct._id
        }
      });
    spyOnMethod("copyCartToOrder", cart.userId);
    const orderId = Meteor.call("cart/copyCartToOrder", cart._id).result;
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
