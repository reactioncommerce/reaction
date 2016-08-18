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
    if (Array.isArray(Collections.Products._hookAspects.remove.after) && Collections.Products._hookAspects.remove.after.length) {
      productRemoveStub = sinon.stub(Collections.Products._hookAspects.remove.after[0], "aspect");
      productInsertStub = sinon.stub(Collections.Products._hookAspects.insert.after[0], "aspect");
    }
  });

  after(function () {
    productRemoveStub.restore();
    productInsertStub.restore();
  });

  describe("Orders", () => {
    const thisContext = {
      userId: "userId",
      ready: function () { return "ready"; }
    };

    it("should return shop orders for an admin", function () {
      sandbox.stub(Collections.Orders._hookAspects.insert.before[0], "aspect");
      sandbox.stub(Collections.Orders._hookAspects.update.before[0], "aspect");
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Meteor.server.method_handlers, "inventory/register", function () {
        check(arguments, [Match.Any]);
      });
      sandbox.stub(Meteor.server.method_handlers, "inventory/sold", function () {
        check(arguments, [Match.Any]);
      });
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Roles, "userIsInRole", () => true);
      order = Factory.create("order", { status: "created" });
      const publication = Meteor.server.publish_handlers["Orders"];
      const cursor = publication.apply(thisContext);
      const data = cursor.fetch()[0];
      expect(data.shopId).to.equal(order.shopId);
    });

    it("should not return shop orders for non admin", function () {
      sandbox.stub(Collections.Orders._hookAspects.insert.before[0], "aspect");
      sandbox.stub(Collections.Orders._hookAspects.update.before[0], "aspect");
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Meteor.server.method_handlers, "inventory/register", function () {
        check(arguments, [Match.Any]);
      });
      sandbox.stub(Meteor.server.method_handlers, "inventory/sold", function () {
        check(arguments, [Match.Any]);
      });
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Roles, "userIsInRole", () => false);
      order = Factory.create("order", { status: "created" });
      const publication = Meteor.server.publish_handlers["Orders"];
      const cursor = publication.apply(thisContext);
      expect(cursor.fetch().length).to.equal(0);
    });
  });
});


