/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { check, Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Roles } from "meteor/alanning:roles";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";

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
    it("should return shop orders for an admin", function (done) {
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
      const order = Factory.create("order", { status: "created" });
      const collector = new PublicationCollector({ userId: Random.id() });
      collector.collect("Orders", (collections) => {
        expect(collections.Orders.length).to.equal(1);
        const shopOrder = collections.Orders[0];
        expect(shopOrder.shopId).to.equal(order.shopId);
        done();
      });
    });

    it("should not return shop orders for a non-admin", function (done) {
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
      Factory.create("order", { status: "created" });
      const collector = new PublicationCollector({ userId: Random.id() });
      collector.collect("Orders", (collections) => {
        expect(collections.Orders.length).to.equal(0);
        done();
      });
    });
  });
});
