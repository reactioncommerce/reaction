/* eslint-disable require-jsdoc */
jest.mock("/lib/core/url-common");

import { composeUrl } from "/lib/core/url-common";
import { DomainsMixin } from "./domains";

describe("DomainsMixin", () => {
  let path;
  let connectionHost;
  let rootUrl;

  beforeEach(() => {
    // commonly used test vars
    path = randomString();
    connectionHost = `${randomString()}.reactioncommerce.com`;
  });

  describe("#absoluteUrl", () => {
    beforeEach(() => {
      // mocking $ROOT_URL
      const ROOT_URL = `https://${randomString()}.reactioncommerce.com`;

      if (!composeUrl.defaultOptions) {
        composeUrl.defaultOptions = {};
      }
      composeUrl.defaultOptions.rootUrl = ROOT_URL;

      rootUrl = `https://${document.location.host}/`;
    });

    describe("before the domain is set", () => {
      test("wraps composeUrl without parameters", () => {
        DomainsMixin.absoluteUrl();

        expect(composeUrl).toHaveBeenCalledWith(undefined, { rootUrl });
      });

      test("wraps composeUrl with path only", () => {
        DomainsMixin.absoluteUrl(path);

        expect(composeUrl).toHaveBeenCalledWith(path, { rootUrl });
      });

      test("wraps composeUrl with options only", () => {
        const options = { optionA: 1, optionB: 2 };

        DomainsMixin.absoluteUrl(options);

        expect(composeUrl).toHaveBeenCalledWith(undefined, { ...options, rootUrl });
      });

      test("wraps composeUrl both a path and options", () => {
        const options = { optionA: 1, optionB: 2 };

        DomainsMixin.absoluteUrl(path, options);

        expect(composeUrl).toHaveBeenCalledWith(path, { ...options, rootUrl });
      });
    });

    describe("within the domain set", () => {
      beforeEach(() => {
        jest.spyOn(DomainsMixin, "shopDomain").mockReturnValue(connectionHost);

        DomainsMixin.absoluteUrl();
      });

      test("uses the current connection's host", () => {
        expect(composeUrl)
          .toHaveBeenCalledWith(undefined, expect.objectContaining({
            rootUrl: expect.stringContaining(connectionHost)
          }));
      });

      test("uses $ROOT_URL's protocol/scheme", () => {
        // this would he http:// if $ROOT_URL had not used https://
        expect(composeUrl)
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
