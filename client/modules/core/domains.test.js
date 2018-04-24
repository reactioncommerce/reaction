import { Meteor } from "meteor/meteor";

import { DomainsMixin } from "./domains";

describe("DomainsMixin", () => {
  let path;
  let connectionHost;

  beforeEach(() => {
    // commonly used test vars
    path = randomString();
    connectionHost = `${randomString()}.reactioncommerce.com`;
  });

  describe("#absoluteUrl", () => {
    beforeEach(() => {
      // mocking $ROOT_URL
      const ROOT_URL = `https://${randomString()}.reactioncommerce.com`;

      if (!Meteor.absoluteUrl.defaultOptions) {
        Meteor.absoluteUrl.defaultOptions = {};
      }
      Meteor.absoluteUrl.defaultOptions.rootUrl = ROOT_URL;
    });

    describe("before the domain is set", () => {
      test("wraps Meteor.absoluteUrl without parameters", () => {
        DomainsMixin.absoluteUrl();

        expect(Meteor.absoluteUrl).toHaveBeenCalledWith(undefined, {});
      });

      test("wraps Meteor.absoluteUrl with path only", () => {
        DomainsMixin.absoluteUrl(path);

        expect(Meteor.absoluteUrl).toHaveBeenCalledWith(path, {});
      });

      test("wraps Meteor.absoluteUrl with options only", () => {
        const options = { a: 1, b: 2 };

        DomainsMixin.absoluteUrl(options);

        expect(Meteor.absoluteUrl).toHaveBeenCalledWith(undefined, options);
      });

      test("wraps Meteor.absoluteUrl both a path and options", () => {
        const options = { a: 1, b: 2 };

        DomainsMixin.absoluteUrl(path, options);

        expect(Meteor.absoluteUrl).toHaveBeenCalledWith(path, options);
      });
    });

    describe("within the domain set", () => {
      beforeEach(() => {
        jest.spyOn(DomainsMixin, "shopDomain").mockReturnValue(connectionHost);

        DomainsMixin.absoluteUrl();
      });

      test("uses the current connection's host", () => {
        expect(Meteor.absoluteUrl)
          .toHaveBeenCalledWith(undefined, expect.objectContaining({
            rootUrl: expect.stringContaining(connectionHost)
          }));
      });

      test("uses $ROOT_URL's protocol/scheme", () => {
        // this would he http:// if $ROOT_URL had not used https://
        expect(Meteor.absoluteUrl)
          .toHaveBeenCalledWith(undefined, expect.objectContaining({
            rootUrl: expect.stringMatching(/^https:\/\//)
          }));
      });
    });
  });

  describe("#getDomain", () => {
    test("returns the domain portion of absoluteUrl", () => {
      jest.spyOn(DomainsMixin, "absoluteUrl")
        .mockReturnValue(`https://${connectionHost}:80/${path}`);

      expect(DomainsMixin.getDomain())
        .toEqual(connectionHost);
    });
  });

  function randomString() {
    return Math.random().toString(36);
  }
});
