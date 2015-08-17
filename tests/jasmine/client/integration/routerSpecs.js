/*
 * client integration tests for layouts
 * integration tests are those that check client
 * interactions with the server
 */
describe('Router', function () {

  describe('Index', function () {
    describe("meta data", function() {
      beforeAll(function (done) {
        Router.go('/');
        Tracker.afterFlush(done);
      });

      beforeEach(waitForRouter);
      it("path should be root url", function() {
        var route;
        route = Router.current().url;
        expect(route).toEqual("/");
      });

      it('should have meta:description', function () {
        waitForElement($('meta[name="description"]'), function() {
          expect($('meta[name="description"]').attr("content")).not.toBeUndefined();
        });
      });

      it('should have meta itemprop:description', function () {
        waitForElement($('meta[itemprop="description"]'), function() {
          expect($('meta[itemprop="description"]').attr("content")).not.toBeUndefined();
        });
      });

      it('should have meta og:description', function () {
        waitForElement($('meta[property="og:description"]'), function() {
          expect($('meta[property="og:description"]').attr("content")).not.toBeUndefined();
        });
      });

      it('should have meta og:title', function () {
        waitForElement($('meta[property="og:title"]'), function() {
          expect($('meta[property="og:title"]').attr("content")).not.toBeUndefined();
        });
      });

      it('should have a title set to Index', function () {
        expect($('title').text()).toEqual("REACTION | Index");
      });

    });

  });

  describe("Product", function() {
    describe("meta data", function() {
      beforeAll(function (done) {
        Router.go('/product/example-product');
        Tracker.afterFlush(done);
      });

      beforeEach(waitForRouter);

      it("url should be product/example-product", function() {
        var route;
        route = Router.current().url;
        expect(route).toContain("product/example-product");
      });
      // waitForElement doesn't play nice with these next two cases
      it('should have meta:description', function () {
        expect($('meta[name="description"]').attr("content")).not.toBeUndefined();
      });

      it('should have meta itemprop:description', function () {
        expect($('meta[itemprop="description"]').attr("content")).not.toBeUndefined();
      });

      it('should have meta og:description', function () {
        waitForElement($('meta[property="og:description"]'), function() {
          expect($('meta[property="og:description"]').attr("content")).not.toBeUndefined();
        });
      });

      it('should have meta og:title', function () {
        waitForElement($('meta[property="og:title"]'), function() {
          expect($('meta[property="og:title"]').attr("content")).not.toBeUndefined();
        });
      });

      it('should have a title set to Example Product', function () {
        expect($('title').text()).toEqual("REACTION | Example Product");
      });

    });

    describe("tags", function() {
      it('loads navigation header', function() {
        expect($('.header-tag').text()).toContain('Products');
      });
    });

    describe("users", function() {
      it("should have a user id", function() {
        expect(Meteor.userId()).not.toBeNull();
      });
    });

  });
});
