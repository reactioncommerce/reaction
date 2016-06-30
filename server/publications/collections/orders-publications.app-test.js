/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Roles } from "meteor/alanning:roles";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe("Order Publication", function () {
  const shop = getShop();
  let sandbox;
  let productRemoveStub;
  let productInsertStub;
  let productUpdateBeforeStub;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    Collections.Orders.direct.remove();
  });

  afterEach(function () {
    sandbox.restore();
    Collections.Orders.direct.remove();
  });

  before(function () {
    // We are mocking inventory hooks, because we don't need them here, but
    // if you want to do a real stress test, you could try to comment out
    // this spyOn lines. This is needed only for ./reaction test. In one
    // package test this is ignoring.
    console.log(Collections.Products._hookAspects);
    if (Array.isArray(Collections.Products._hookAspects.remove.after) && Collections.Products._hookAspects.remove.after.length) {
      productRemoveStub = sinon.stub(Collections.Products._hookAspects.remove.after[0], "aspect");
      productInsertStub = sinon.stub(Collections.Products._hookAspects.insert.after[0], "aspect");
      productUpdateBeforeStub = sinon.stub(Collections.Products._hookAspects.update.after[0], "aspect");
    }
    // Collections.Products.remove({});
    // // really strange to see this, but without this `remove` finishes in
    // // async way (somewhere in a middle of testing process)
    // Meteor.setTimeout(function () {
    //   Collections.Orders.remove({});
    // }, 500);
  });

  after(function () {
    productRemoveStub.restore();
    productInsertStub.restore();
    productUpdateBeforeStub.restore();
  });

  describe("Orders", () => {
    const thisContext = {
      userId: "userId",
      ready: function () { return "ready"; }
    };
    let order;

    // beforeEach(() => {
    //   sandbox.stub(Reaction, "getShopId", () => shop._id);
    //   // spyOn(Reaction, "getShopId").and.returnValue(shop._id);
    // });

    it("Should create an order", function () {
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Roles, "userIsInRole", () => true);
      product = Factory.create("product");
      user = Factory.create("user");
      // order = Factory.create("order");
    });

    it.skip("should return shop orders for an admin", function () {
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Roles, "userIsInRole", () => true);
      order = Factory.create("order", { status: "created" });
      const publication = Meteor.server.publish_handlers["Orders"];
      const cursor = publication.apply(thisContext);
      const data = cursor.fetch()[0];
      expect(data.shopId).to.equal(order.shopId);
    });

    it.skip("should not return shop orders for non admin", function () {
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Roles, "userIsInRole", () => false);
      order = Factory.create("order", { status: "created" });
      // spyOn(Roles, "userIsInRole").and.returnValue(false);
      const publication = Meteor.server.publish_handlers["Orders"];
      const cursor = publication.apply(thisContext);
      expect(cursor.fetch().count()).to.equal(0);
    });
  });
});


