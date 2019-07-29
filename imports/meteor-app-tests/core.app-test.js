import { Meteor } from "meteor/meteor";

import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Shops } from "/lib/collections";

import Logger from "@reactioncommerce/logger";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ConnectionDataStore from "/imports/plugins/core/core/server/util/connectionDataStore";

/**
 * @return {String} A random string
 */
function randomString() {
  return Math.random().toString(36);
}

describe("Server/API/Core", () => {
  let sandbox;
  let shop;

  before(function (done) {
    this.timeout(20000);
    Reaction.onAppStartupComplete(() => {
      done();
    });
  });

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    shop = { _id: randomString() };
  });

  afterEach(() => {
    sandbox.restore();
    shop = undefined;
  });

  describe("#getPrimaryShop", () => {
    it("returns the shop tagged as primary", () => {
      sandbox.stub(Shops, "findOne")
        .withArgs({ shopType: "primary" })
        .returns(shop);

      expect(Reaction.getPrimaryShop()).to.be.equal(shop);
    });
  });

  describe("#getShopId", () => {
    afterEach(() => {
      Reaction.resetShopId();
    });

    it("returns the cached value if applicable", () => {
      sandbox.stub(ConnectionDataStore, "get")
        .withArgs("shopId")
        .returns(shop._id);

      expect(Reaction.getShopId()).to.equal(shop._id);
    });

    it("fetches a user's preferred shop", () => {
      const userId = randomString();

      sandbox.stub(Meteor, "userId").returns(userId);

      const fnGetUserShopId =
        sandbox.stub(Reaction, "getUserShopId").withArgs(userId).returns(shop._id);

      expect(Reaction.getShopId()).to.equal(shop._id);
      expect(fnGetUserShopId.called).to.be.true;
    });

    it("gets the shop by domain", () => {
      const fnGetShopIdByDomain =
        sandbox.stub(Reaction, "getShopIdByDomain").returns(shop._id);

      sandbox.stub(Meteor, "userId").returns(null);

      expect(Reaction.getShopId()).to.equal(shop._id);
      expect(fnGetShopIdByDomain.called).to.be.true;
    });

    it("defaults to the Primary Shop", () => {
      const primaryShopId = randomString();
      const fnGetPrimaryShopId =
        sandbox.stub(Reaction, "getPrimaryShopId").returns(primaryShopId);
      const fnLogger =
        sandbox.stub(Logger, "warn").withArgs(sinon.match(/No shop matching/));
      sandbox.stub(Meteor, "userId").returns(null);
      sandbox.stub(Reaction, "getShopIdByDomain").returns(null);

      expect(Reaction.getShopId()).to.equal(primaryShopId);
      expect(fnGetPrimaryShopId.called).to.be.true;
      expect(fnLogger.called).to.be.true;
    });

    it("caches the shopId for subsequent calls", () => {
      const fnSetCachedData = sandbox.stub(ConnectionDataStore, "set").withArgs("shopId", shop._id);

      sandbox.stub(Meteor, "userId").returns(null);
      sandbox.stub(Reaction, "getShopIdByDomain").returns(shop._id);

      Reaction.getShopId();

      expect(fnSetCachedData.called).to.be.true;
    });
  });

  describe("#resetShopId", () => {
    it("clears shopId from cache", () => {
      const fnCacheClear =
        sandbox.spy(ConnectionDataStore, "clear").withArgs("shopId");

      Reaction.resetShopId();

      expect(fnCacheClear.called).to.be.true;
    });
  });

  describe("#getShopIdByDomain", () => {
    it("gets the shop with the domain attribute which includes the current domain", () => {
      const domain = `${randomString()}.reactioncommerce.com`;
      const shopsCursor = {
        fetch: () => [shop]
      };

      sandbox.stub(Reaction, "getDomain").returns(domain);

      sandbox.stub(Shops, "find")
        .withArgs({ domains: domain }, sinon.match.any)
        .returns(shopsCursor);

      expect(Reaction.getShopIdByDomain()).to.equal(shop._id);
    });
  });

  describe("#isShopPrimary", () => {
    let primaryShopId;

    beforeEach(() => {
      primaryShopId = randomString();
    });

    it("is true when the current shop is the Primary Shop", () => {
      sandbox.stub(Reaction, "getShopId", () => primaryShopId);
      sandbox.stub(Reaction, "getPrimaryShopId", () => primaryShopId);

      expect(Reaction.isShopPrimary()).to.be.true;
    });

    it("is false when the current shop is a Merchant Shop", () => {
      const shopId = `xxx${primaryShopId}xxx`;

      sandbox.stub(Reaction, "getShopId", () => shopId);
      sandbox.stub(Reaction, "getPrimaryShopId", () => primaryShopId);

      expect(Reaction.isShopPrimary()).to.be.false;
    });
  });
});
