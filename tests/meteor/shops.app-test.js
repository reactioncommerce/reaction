/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { Factory } from "meteor/dburles:factory";
import { sinon, stubs, spies } from "meteor/practicalmeteor:sinon";
import Fixtures from "/imports/plugins/core/core/server/fixtures";
import Reaction from "/imports/plugins/core/core/server/Reaction";
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

  it("shop factory should create a new shop", function () {
    stubs.create("hasPermissionStub", Reaction, "hasPermission");
    stubs.hasPermissionStub.returns(true);
    spies.create("shopInsertSpy", Shops, "insert");
    Factory.create("shop");
    expect(spies.shopInsertSpy).to.have.been.called;
  });
});

describe("core shop methods", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("shop/createShop", function () {
    let primaryShop;
    let insertShopSpy;

    beforeEach(function () {
      Shops.remove({});

      primaryShop = Factory.create("shop");
      sandbox.stub(Reaction, "getPrimaryShop", () => primaryShop);

      insertShopSpy = sandbox.spy(Shops, "insert");
    });

    describe("failure conditions", function () {
      it("throws a 403 error by non admin", function () {
        sandbox.stub(Reaction, "hasPermission", () => false);

        expect(() => Meteor.call("shop/createShop"))
          .to.throw(Meteor.Error, /Access Denied/);
        expect(insertShopSpy).to.not.have.been.called;
      });
    });

    describe("success conditions", function () {
      let userId;
      let shopId;
      let name;

      beforeEach(function () {
        userId = Random.id();
        shopId = Random.id();
        name = Random.id();

        Factory.create("account", { _id: userId, shopId });

        sandbox.stub(Meteor, "user", () => ({
          userId,
          emails: [{
            address: `${userId}@example.com`,
            provides: "default",
            verified: true
          }]
        }));
        sandbox.stub(Reaction, "hasPermission", () => true);
        sandbox.stub(Reaction, "getPrimaryShopId", () => shopId);

        // a logging statement exists, stub it to keep the output clean
        sandbox.stub(Logger, "info")
          .withArgs(sinon.match(/Created shop/), sinon.match.string);
      });

      afterEach(function () {
        const newShopCount = Shops.find({ name }).count();
        expect(newShopCount).to.equal(1);
      });

      it("creates a new shop for admin for userId and a partial shopObject", function () {
        this.timeout(15000);
        const partialShop = { name };

        Meteor.call("shop/createShop", userId, partialShop);
      });

      it("creates a new shop for admin for userId and a partial shopObject ignoring extraneous data", function () {
        this.timeout(15000);
        const extraneousData = Random.id();
        const partialShop = { name, extraneousData };

        Meteor.call("shop/createShop", userId, partialShop);

        expect(insertShopSpy)
          .to.have.been.calledWith(sinon.match({ name }));
        expect(insertShopSpy)
          .to.not.have.been.calledWith(sinon.match({ extraneousData }));
      });
    });
  });
});

describe("shop/changeLayouts", function () {
  it("should replace every layout with the new layout", function () {
    this.timeout(15000);
    const shop = Factory.create("shop");
    Meteor.call("shop/changeLayouts", shop._id, "myNewLayout");
    const myShop = Shops.findOne(shop._id);
    for (const layout of myShop.layout) {
      expect(layout.layout).to.equal("myNewLayout");
    }
  });
});
