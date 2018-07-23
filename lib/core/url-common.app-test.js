import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";

import { composeUrl } from "./url-common";

describe("urlCommon", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("composeUrl", () => {
    let path;
    let rootUrl;
    let initialOptions;

    beforeEach(() => {
      // commonly used test vars
      path = randomString();
      rootUrl = `http://${randomString()}.reactioncommerce.com`;

      // mocking global options
      initialOptions = Object.assign({}, composeUrl.defaultOptions);
      // this is a round-about way of mocking $ROOT_URL
      composeUrl.defaultOptions.rootUrl = rootUrl;
    });

    afterEach(() => {
      // restore global options
      composeUrl.defaultOptions = initialOptions;
    });

    it("allows for no parameters", () => {
      const expected = `${rootUrl}/`;
      expect(composeUrl()).to.equal(expected);
    });

    it("allows for an optional path", () => {
      const expected = `${rootUrl}/${path}`;
      expect(composeUrl(path)).to.equal(expected);
    });

    it("allows for optional options", () => {
      const options = {};

      const expected = `${rootUrl}/`;
      expect(composeUrl(options)).to.equal(expected);
    });

    it("requires a root url", () => {
      const options = {
        rootUrl: null
      };

      expect(() => composeUrl(options))
        .to.throw(/Must pass options\.rootUrl or set ROOT_URL/);
    });

    it("prepends http: when not provided", () => {
      const host = `${randomString()}.reactioncommerce.com`;
      const options = {
        rootUrl: host
      };

      const expected = `http://${host}/`;
      expect(composeUrl(options)).to.equal(expected);
    });

    it("does not prepend http: if rootUrl begins with https", () => {
      const host = `https://${randomString()}.reactioncommerce.com`;
      const options = {
        rootUrl: host
      };

      const expected = `${host}/`;
      expect(composeUrl(options)).to.equal(expected);
    });

    it("uses https with the `secure` option", () => {
      const host = `${randomString()}.reactioncommerce.com`;
      const options = {
        rootUrl: host,
        secure: true
      };

      const expected = `https://${host}/`;
      expect(composeUrl(options)).to.equal(expected);
    });

    it("uses https with the `secure` option, unless localhost", () => {
      const host = "localhost";
      const options = {
        rootUrl: host,
        secure: true
      };

      const expected = `http://${host}/`;
      expect(composeUrl(options)).to.equal(expected);
    });

    it("uses https with the `secure` option, unless 127.0.0.1", () => {
      const host = "127.0.0.1";
      const options = {
        rootUrl: host,
        secure: true
      };

      const expected = `http://${host}/`;
      expect(composeUrl(options)).to.equal(expected);
    });

    it("replaces localhost with IP with `replaceLocalhost` option", () => {
      const host = "localhost";
      const options = {
        replaceLocalhost: true,
        rootUrl: host,
        secure: true
      };

      const expected = "http://127.0.0.1/";
      expect(composeUrl(options)).to.equal(expected);
    });

    describe("with global settings", () => {
      it("honors the global setting `rootUrl`", () => {
        composeUrl.defaultOptions.rootUrl = rootUrl;

        const expected = `${rootUrl}/${path}`;
        expect(composeUrl(path)).to.equal(expected);
      });

      it("honors the global setting `secure`", () => {
        composeUrl.defaultOptions.secure = true;

        const expected =
          `${rootUrl}/${path}`.replace(/^http:\/\//, "https://");

        expect(composeUrl(path)).to.equal(expected);
      });

      it("honors the global setting `replaceLocalhost`", () => {
        composeUrl.defaultOptions.replaceLocalhost = true;
        const options = {
          rootUrl: "localhost"
        };

        const expected = `http://127.0.0.1/${path}`;
        expect(composeUrl(path, options)).to.equal(expected);
      });
    });
  });

  function randomString() {
    return Math.random().toString(36);
  }
});
