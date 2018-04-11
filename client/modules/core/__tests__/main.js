import { Meteor } from "meteor/meteor";

import main from "../main";

describe("Client/API/Core", () => {
  let path;
  let connectionHost;
  let ROOT_URL;

  beforeEach(() => {
    // commonly used test vars
    path = randomString();
    connectionHost = `${randomString()}.reactioncommerce.com`;
    // mocking $ROOT_URL
    ROOT_URL = `https://${randomString()}.reactioncommerce.com`;
  });

  describe("#absoluteUrl", () => {
    beforeEach(() => {
      if (!Meteor.absoluteUrl.defaultOptions) {
        Meteor.absoluteUrl.defaultOptions = {};
      }
      Meteor.absoluteUrl.defaultOptions.rootUrl = ROOT_URL;
    });

    describe("before the domain is set", () => {
      it("wraps Meteor.absoluteUrl without parameters", () => {
        main.absoluteUrl();

        expect(Meteor.absoluteUrl).toBeCalledWith(undefined, {});
      });

      it("wraps Meteor.absoluteUrl with path only", () => {
        main.absoluteUrl(path);

        expect(Meteor.absoluteUrl).toBeCalledWith(path, {});
      });

      it("wraps Meteor.absoluteUrl with options only", () => {
        const options = { a: 1, b: 2 };

        main.absoluteUrl(options);

        expect(Meteor.absoluteUrl).toBeCalledWith(undefined, options);
      });

      it("wraps Meteor.absoluteUrl both a path and options", () => {
        const options = { a: 1, b: 2 };

        main.absoluteUrl(path, options);

        expect(Meteor.absoluteUrl).toBeCalledWith(path, options);
      });
    });

    describe("within the domain set", () => {
      beforeEach(() => {
        main._shopDomain.set(connectionHost);

        main.absoluteUrl();
      });

      it("uses the current connection's host", () => {
        expect(Meteor.absoluteUrl)
          .toBeCalledWith(undefined, expect.objectContaining({
            rootUrl: expect.stringContaining(connectionHost)
          }));
      });

      it("uses $ROOT_URL's protocol/scheme", () => {
        // this would he http:// if $ROOT_URL had not used https://
        expect(Meteor.absoluteUrl)
          .toBeCalledWith(undefined, expect.objectContaining({
            rootUrl: expect.stringMatching(/^https:\/\//)
          }));
      });
    });
  });

  function randomString() {
    return Math.random().toString(36);
  }
});
