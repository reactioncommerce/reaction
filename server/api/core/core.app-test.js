import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp-client";

import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Shops } from "/lib/collections";

import core from "./core";
import ConnectionDataStore from "./connectionDataStore";

describe("Server/API/Core", () => {
  let sandbox;
  let shop;

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

      expect(core.getPrimaryShop()).to.be.equal(shop);
    });
  });

  describe("#getShopId", () => {
    afterEach(() => {
      core.resetShopId();
    });

    it("returns the cached value if applicable", () => {
      sandbox.stub(ConnectionDataStore, "get")
        .withArgs("shopId")
        .returns(shop._id);

      expect(core.getShopId()).to.equal(shop._id);
    });

    it("fetches a user's preferred shop", () => {
      const userId = randomString();

      sandbox.stub(Meteor, "userId").returns(userId);

      const fnGetUserShopId =
        // sandbox.stub(core, "getUserShopId").withArgs(userId).returns(shop._id);
        sandbox.stub(core, "getUserShopId").returns(shop._id);

      expect(core.getShopId()).to.equal(shop._id);
      expect(fnGetUserShopId.called).to.be.true;
    });

    it("gets the shop by domain", () => {
      const fnGetShopIdByDomain =
        sandbox.stub(core, "getShopIdByDomain").returns(shop._id);

      sandbox.stub(Meteor, "userId").returns(null);

      expect(core.getShopId()).to.equal(shop._id);
      expect(fnGetShopIdByDomain.called).to.be.true;
    });

    it("caches the shopId for subsequent calls", () => {
      const fnSetCachedData = sandbox.stub(ConnectionDataStore, "set").withArgs("shopId", shop._id);

      sandbox.stub(Meteor, "userId").returns(null);
      sandbox.stub(core, "getShopIdByDomain").returns(shop._id);

      core.getShopId();

      expect(fnSetCachedData.called).to.be.true;
    });
  });

  describe("#resetShopId", () => {
    it("clears shopId from cache", () => {
      const fnCacheClear =
        sandbox.spy(ConnectionDataStore, "clear").withArgs("shopId");

      core.resetShopId();

      expect(fnCacheClear.called).to.be.true;
    });
  });

  describe("#getShopIdByDomain", () => {
    it("gets the shop with the domain attribute which includes the current domain", () => {
      const domain = `${randomString()}.reactioncommerce.com`;
      const shopsCursor = {
        fetch: () => [shop]
      };

      sandbox.stub(core, "getDomain").returns(domain);

      sandbox.stub(Shops, "find")
        .withArgs({ domains: domain }, sinon.match.any)
        .returns(shopsCursor);

      expect(core.getShopIdByDomain()).to.equal(shop._id);
    });
  });

  describe("#getUserShopId", () => {
    let userId;

    beforeEach(() => {
      userId = randomString();
    });

    it("ensures you pass a userId", () => {
      expect(() => core.getUserShopId()).to.throw();
    });

    it("gets the shopId from a user's preferences store", () => {
      const fnUserSettings = sandbox.stub(core, "getUserPreferences")
        .withArgs(sinon.match({
          userId,
          preference: "activeShopId"
        }));

      core.getUserShopId(userId);

      expect(fnUserSettings.called).to.be.true;
    });
  });

  describe("#absoluteUrl", () => {
    let path;
    let connectionHost;
    let rootUrl;
    let meteorRoolUrl;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      // commonly used test vars
      path = randomString();
      connectionHost = `${randomString()}.reactioncommerce.com`;
      rootUrl = `https://${randomString()}.reactioncommerce.com`;

      // mocking Meteor
      meteorRoolUrl = Meteor.absoluteUrl.defaultOptions.rootUrl;
      // this is a round-about way of mocking $ROOT_URL
      Meteor.absoluteUrl.defaultOptions.rootUrl = rootUrl;
    });

    afterEach(() => {
      sandbox.restore();

      // restore Meteor
      Meteor.absoluteUrl.defaultOptions.rootUrl = meteorRoolUrl;
    });

    it("wraps Meteor.absoluteUrl", () => {
      const options = { rootUrl }; // passing rootUrl will skip some internal logic

      const fnMeteorAbsoluteUrl =
        sandbox.spy(Meteor, "absoluteUrl").withArgs(path, options);

      core.absoluteUrl(path, options);

      expect(fnMeteorAbsoluteUrl).to.have.been.called;
    });

    describe("outside of a connection", () => {
      it("defaults to $ROOT_URL", () => {
        expect(core.absoluteUrl()).to.include(rootUrl);
      });
    });

    describe("within a connection", () => {
      beforeEach(() => {
        // for reference: https://github.com/meteor/meteor/blob/ed98a07125cd072552482ca2244239f034857814/packages/ddp-server/livedata_server.js#L279-L295
        sinon.stub(DDP._CurrentMethodInvocation, "get").returns({
          connection: { httpHeaders: { host: connectionHost } }
        });
      });

      afterEach(() => {
        DDP._CurrentMethodInvocation.get.restore();
      });

      it("uses the current connection's host", () => {
        expect(core.absoluteUrl()).to.include(connectionHost);
      });

      it("uses $ROOT_URL's protocol/scheme", () => {
        // this would he http:// if $ROOT_URL had not used https://
        expect(core.absoluteUrl()).to.startsWith("https://");
      });
    });

    it("accepts options the same way Meteor.absoluteUrl does", () => {
      const options = {
        secure: true,
        replaceLocalhost: true,
        rootUrl: "http://127.0.0.1"
      };

      const reactionVersion = core.absoluteUrl(path, options);
      const meteorVersion = Meteor.absoluteUrl(path, options);

      expect(reactionVersion).to.equal(meteorVersion);
    });
  });

  function randomString() {
    return Math.random().toString(36);
  }
});
