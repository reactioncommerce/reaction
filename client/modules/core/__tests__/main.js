import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";

import { Meteor } from "meteor/meteor";

import main from "./main";

describe("Client/API/Core", () => {
  let sandbox;
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

  describe("#absoluteUrl", () => {
    it("wraps Meteor.absoluteUrl", () => {
      const options = { rootUrl }; // passing rootUrl will skip some internal logic

      const fnMeteorAbsoluteUrl =
        sandbox.spy(Meteor, "absoluteUrl").withArgs(path, options);

      main.absoluteUrl(path, options);

      expect(fnMeteorAbsoluteUrl).to.have.been.called;
    });

    describe("before the domain is set", () => {
      it("defaults to $ROOT_URL", () => {
        expect(main.absoluteUrl()).to.include(rootUrl);
      });
    });

    describe("within the domain set", () => {
      let previousShopDomain;

      beforeEach(() => {
        previousShopDomain = main._shopDomain.get();
        main._shopDomain.set(connectionHost);
      });

      afterEach(() => {
        main._shopDomain.set(previousShopDomain);
      });

      it("uses the current connection's host", () => {
        expect(main.absoluteUrl()).to.include(connectionHost);
      });

      it("uses $ROOT_URL's protocol/scheme", () => {
        // this would he http:// if $ROOT_URL had not used https://
        expect(main.absoluteUrl()).to.startsWith("https://");
      });
    });

    it("accepts parameters the same way Meteor.absoluteUrl does", () => {
      const options = {
        secure: true,
        replaceLocalhost: true,
        rootUrl: "http://127.0.0.1"
      };

      const reactionVersion = main.absoluteUrl(options);
      const meteorVersion = Meteor.absoluteUrl(options);

      expect(reactionVersion).to.equal(meteorVersion);
    });
  });

  function randomString() {
    return Math.random().toString(36);
  }
});
