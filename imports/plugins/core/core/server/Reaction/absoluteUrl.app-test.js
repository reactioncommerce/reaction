import { DDP } from "meteor/ddp-client";

import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";

import { composeUrl } from "/lib/core/url-common";
import core from "./core";

describe("AbsoluteUrlMixin", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("#absoluteUrl", () => {
    let path;
    let connectionHost;
    let rootUrl;
    let meteorRootUrl;

    beforeEach(() => {
      // commonly used test vars
      path = randomString();
      connectionHost = `${randomString()}.reactioncommerce.com`;
      rootUrl = `https://${randomString()}.reactioncommerce.com`;

      // mocking Meteor
      meteorRootUrl = composeUrl.defaultOptions.rootUrl;
      // this is a round-about way of mocking $ROOT_URL
      composeUrl.defaultOptions.rootUrl = rootUrl;
    });

    afterEach(() => {
      // restore Meteor
      composeUrl.defaultOptions.rootUrl = meteorRootUrl;
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

    it("accepts options the same way composeUrl does", () => {
      const options = {
        secure: true,
        replaceLocalhost: true,
        rootUrl: "http://127.0.0.1"
      };

      const reactionVersion = core.absoluteUrl(path, options);
      const meteorVersion = composeUrl(path, options);

      expect(reactionVersion).to.equal(meteorVersion);
    });
  });

  function randomString() {
    return Math.random().toString(36);
  }
});
