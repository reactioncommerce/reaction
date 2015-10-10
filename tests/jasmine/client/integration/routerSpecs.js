/*
 * client integration tests for layouts
 * integration tests are those that check client
 * interactions with the server
 */
describe("Router", function () {
  describe("Index", function () {
    beforeEach(function (done) {
      Router.go("/");
      Tracker.afterFlush(done);
    });

    beforeEach(waitForRouter);

    describe("meta data", function () {
      it("path should be root url", function () {
        const route = Router.current().url;
        expect(route).toEqual("/");
      });

      it("should have meta:description", function () {
        waitForElement($('meta[name="description"]'), function () {
          expect($('meta[name="description"]').attr("content")).not.toBeUndefined();
        });
      });

      it("should have meta itemprop:description", function () {
        waitForElement($('meta[itemprop="description"]'), function () {
          expect($('meta[itemprop="description"]').attr("content")).not.toBeUndefined();
        });
      });

      it("should have meta og:description", function () {
        waitForElement($('meta[property="og:description"]'), function () {
          expect($('meta[property="og:description"]').attr("content")).not.toBeUndefined();
        });
      });

      it("should have meta og:title", function () {
        waitForElement($('meta[property="og:title"]'), function () {
          expect($('meta[property="og:title"]').attr("content")).not.toBeUndefined();
        });
      });

      it("should have a title set to Index", function () {
        expect($("title")).toContainText("REACTION | Index");
      });
    });

    // users
    describe("users", function () {
      it("should have a user id", function () {
        expect(Meteor.userId()).not.toBeNull();
      });
    });
  });
});
