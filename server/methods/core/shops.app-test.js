/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { expect } from "meteor/practicalmeteor:chai";
import { Factory } from "meteor/dburles:factory";
import { sinon, stubs, spies } from "meteor/practicalmeteor:sinon";
import Fixtures from "/server/imports/fixtures";
import { Reaction } from "/server/api";
import { Shops } from "/lib/collections";

Fixtures();

describe("Shop Methods", function () {
  beforeEach(function () {
    return Shops.remove({});
  });

  after(function () {
    spies.restoreAll();
    stubs.restoreAll();
  });

  it("shop factory should create a new shop", function (done) {
    stubs.create("hasPermissionStub", Reaction, "hasPermission");
    stubs.hasPermissionStub.returns(true);
    spies.create("shopInsertSpy", Shops, "insert");
    Factory.create("shop");
    expect(spies.shopInsertSpy).to.have.been.called;
    return done();
  });
});

describe("core shop methods", function () {
  let shop;
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    shop = Factory.create("shop");
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("shop/createShop", function () {
    beforeEach(function () {
      Shops.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const insertShopSpy = sandbox.spy(Shops, "insert");
      function createShopFunc() {
        return Meteor.call("shop/createShop");
      }
      expect(createShopFunc).to.throw(Meteor.Error, /Access Denied/);
      expect(insertShopSpy).to.not.have.been.called;
      return done();
    });

    it("should create new shop for admin for userId and shopObject", function () {
      this.timeout(5000);
      sandbox.stub(Meteor, "user", () => ({
        userId: "12345678",
        emails: [{
          address: "user@example.com",
          provides: "default",
          verified: true
        }]
      }));
      const shopId = Random.id();
      Factory.create("account", { _id: "12345678", shopId });

      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Reaction, "getPrimaryShopId", () => shopId);
      Meteor.call("shop/createShop", "12345678", shop);
      const newShopCount = Shops.find({ name: shop.name }).count();
      expect(newShopCount).to.equal(1);
    });
  });
});

describe("shop/changeLayouts", function () {
  it("should replace every layout with the new layout", function () {
    const shop = Factory.create("shop");
    Meteor.call("shop/changeLayouts", shop._id, "myNewLayout");
    const myShop = Shops.findOne(shop._id);
    for (const layout of myShop.layout) {
      expect(layout.layout).to.equal("myNewLayout");
    }
  });
});
