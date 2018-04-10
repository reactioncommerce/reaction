import { Meteor } from "meteor/meteor";

import { default as main } from "./main";

describe("Client/API/Core", () => {
  const meteorAbsoluteUrl = "https://www.reactioncommerce.com/";
  let path;
  let connectionHost;
  let rootUrl;

  beforeEach(() => {
    // commonly used test vars
    path = randomString();
    connectionHost = `${randomString()}.reactioncommerce.com`;
    rootUrl = `https://${randomString()}.reactioncommerce.com`;
  });

  describe("#absoluteUrl", () => {
    it("wraps Meteor.absoluteUrl", () => {
      const options = { rootUrl }; // passing rootUrl will skip some internal logic

      spyOn(Meteor, "absoluteUrl").mockImplementation(() => meteorAbsoluteUrl);
      expect(Meteor.absoluteUrl).toBeCalledWith(path, options);

      main.absoluteUrl(path, options);
    });

    describe("before the domain is set", () => {
      it("defaults to $ROOT_URL", () => {
        expect(main.absoluteUrl()).toMatch(rootUrl);
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
        expect(main.absoluteUrl()).toMatch(connectionHost);
      });

      it("uses $ROOT_URL's protocol/scheme", () => {
        // this would he http:// if $ROOT_URL had not used https://
        expect(main.absoluteUrl()).toMatch(/^https:\/\//);
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

      expect(reactionVersion).toEqual(meteorVersion);
    });
  });

  function randomString() {
    return Math.random().toString(36);
  }
});
