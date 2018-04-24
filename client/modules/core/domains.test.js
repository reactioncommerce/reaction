import { Meteor } from "meteor/meteor";

import { DomainsMixin } from "./domains";

describe.only("DomainsMixin", () => {
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
      test("wraps Meteor.absoluteUrl without parameters", () => {
        DomainsMixin.absoluteUrl();

        expect(Meteor.absoluteUrl).toBeCalledWith(undefined, {});
      });

      test("wraps Meteor.absoluteUrl with path only", () => {
        DomainsMixin.absoluteUrl(path);

        expect(Meteor.absoluteUrl).toBeCalledWith(path, {});
      });

      test("wraps Meteor.absoluteUrl with options only", () => {
        const options = { a: 1, b: 2 };

        DomainsMixin.absoluteUrl(options);

        expect(Meteor.absoluteUrl).toBeCalledWith(undefined, options);
      });

      test("wraps Meteor.absoluteUrl both a path and options", () => {
        const options = { a: 1, b: 2 };

        DomainsMixin.absoluteUrl(path, options);

        expect(Meteor.absoluteUrl).toBeCalledWith(path, options);
      });
    });

    describe("within the domain set", () => {
      beforeEach(() => {
        DomainsMixin.shopDomain = jest.fn().mockReturnValue(connectionHost);

        DomainsMixin.absoluteUrl();
      });

      test("uses the current connection's host", () => {
        expect(Meteor.absoluteUrl)
          .toBeCalledWith(undefined, expect.objectContaining({
            rootUrl: expect.stringContaining(connectionHost)
          }));
      });

      test("uses $ROOT_URL's protocol/scheme", () => {
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
