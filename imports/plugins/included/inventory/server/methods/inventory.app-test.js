/* eslint dot-notation:0 */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Products, Inventory } from "/lib/collections";
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

    it("should have option quantity greater than 0", function () {
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
});
