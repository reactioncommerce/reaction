/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Products, Inventory }  from "/lib/collections";
import { Reaction } from "/server/api";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { addProduct } from "/server/imports/fixtures/products";
import Fixtures from "/server/imports/fixtures";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";

Fixtures();

describe("inventory method", function () {
  let product;
  let variant;
  let options;
  let quantity;
  let sandbox;
  let roleStub;
  // The thing is... the `inventory/register` called when we creating product
  // and variants within `beforeAll`, so we need to remove all it insert first
  // time before running specs.
  before(() => {
    roleStub = sinon.stub(Roles, "userIsInRole", () => true);
    // spyOn(Roles, "userIsInRole").and.returnValue(true);
    product = addProduct();
    variant = Products.findOne({
      ancestors: [product._id]
    });
    options = Products.find({
      ancestors: [product._id, variant._id]
    }).fetch();
    quantity = options[0].inventoryQuantity;
  });

  after(function () {
    roleStub.restore();
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(RevisionApi, "isRevisionControlEnabled", () => true);
    // again hack. w/o this we can't remove products from previous spec.
    Inventory.remove({}); // Empty Inventory
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("inventory/register", function () {
    it("should add inventory items for child variant", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let inventory = Inventory.find({ variantId: options[0]._id }).count();
      expect(inventory).to.equal(0);

      Meteor.call("inventory/register", options[0]);
      inventory = Inventory.find({ variantId: options[0]._id }).count();
      expect(inventory).to.equal(quantity);

      return done();
    });
  });

  describe("inventory/remove", function () {
    // register inventory (that we'll should delete on variant removal)
    let qty;
    let newQty;

    before(function () {
      qty = options[1].inventoryQuantity;
    });

    beforeEach(function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
    });

    it("should have option quantity greater then 0", function () {
      // checking our option quantity. It should be greater than zero.
      expect(qty).to.be.above(0);
    });

    it("should have equal quantities", function () {
      Meteor.call("inventory/register", options[1]);
      const midQty = Inventory.find({ variantId: options[1]._id }).count();
      expect(midQty).to.equal(qty);
    });

    it("should have new quantity equal to 0", function () {
      // then we are removing option and docs should be automatically removed
      Meteor.call("products/deleteVariant", options[1]._id);
      newQty = Inventory.find({ variantId: options[1]._id }).count();
      expect(newQty).to.equal(0);
    });
  });

  //
  // inventory/register is invoked from hooks.js before cart update
  //
  describe("inventory/register invoked from hooks", function () {
    // it("should create backordered inventory when no inventory available", function (done) {
    //   let product = Factory.create("product");
    //   let cartId = Factory.create("cart")._id;
    //   let productId = product._id;
    //   let quantity = product.variants[0].inventoryQuantity;
    //   let variantData = product.variants[0];
    //
    //   spyOn(ReactionCore, "hasPermission").and.returnValue(true);
    //   spyOn(ReactionCore.Collections.Cart.after, "update");
    //   expect(_.size(product.variants)).toEqual(1);
    //
    //   // add to cart
    //   Meteor.call("cart/addToCart", cartId, productId, variantData, quantity, function () {
    //     // fetch reserved inventory
    //     let inventory = ReactionCore.Collections.Inventory.find({
    //       "workflow.status": "backorder"
    //     });
    //
    //     let inventoryCount = _.size(inventory);
    //     expect(inventoryCount).toEqual(quantity);
    //     done();
    //   });
    // });

    // it("should reserve product variants added to cart", function () {
    //   let product = Factory.create("product");
    //   let cartId = Factory.create("cart")._id;
    //   let productId = product._id;
    //   let quantity = product.variants[0].inventoryQuantity;
    //   let variantData = product.variants[0];
    //   expect(_.size(product.variants)).toEqual(1);
    //   // create some inventory to reserve
    //   spyOn(ReactionCore, "hasPermission").and.returnValue(true);
    //
    //   //Setup a spy to watch for calls to Inventory.insert
    //   spyOn(ReactionCore.Collections.Inventory, "insert");
    //   spyOn(ReactionCore.Collections.Cart, "update");
    //   Meteor.call("inventory/register", product);
    //   expect(ReactionCore.Collections.Inventory.insert).toHaveBeenCalled();
    //
    //   // add to cart (expect to reserve)
    //   Meteor.call("cart/addToCart", cartId, productId, variantData, quantity);
    //   expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
    //
    //   // fetch reserved inventory
    //   console.log("productId", productId);
    //   console.log("variantId", product.variants[0]._id);
    //   console.log("orderId", cartId);
    //
    //   let reservedInventory = ReactionCore.Collections.Inventory.find({
    //     "workflow.status": "reserved"
    //   }).count();
    //   console.log('reservedInventory', reservedInventory);
    //   expect(reservedInventory).toEqual(quantity);;
    // });

    //
    // it("should remove inventory reservation when removed cart", function (
    //   done) {
    //   done();
    // });
    //

    //
    // it("should converted backordered inventory to reserved when inventory available", function (
    //   done) {
    //   done();
    // });
    //
    // it("should update sold inventory on product and inventory when order fulfilled", function (
    //   done) {
    //   done();
    // });
    //
    // it("should make reserved inventory available when cart deleted", function (
    //   done) {
    //   done();
    // });
    //
    // it("should update cart reservations when product sold out", function (
    //   done) {
    //   done();
    // });
    //
    // it("should send inventory notification when low stock on product", function (
    //   done) {
    //   done();
    // });
  });
});
