describe("Product", function () {
  beforeEach(function (done) {
    Router.go("/product/example-product");
    Tracker.afterFlush(done);
  });

  beforeEach(waitForRouter);
  // TODO: Tags should equal current Tag
  // TOOO: Goto Tag, Check for visibility of product
  describe("create", function () {
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Products, "insert");

      Meteor.call("products/createProduct", function (error) {
        expect(error.error).toEqual(403);
      });

      expect(ReactionCore.Collections.Products.insert).not.toHaveBeenCalled();
      return done();
    });

    /*
    it("should create new product by admin", function(done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      productSpy = spyOn(ReactionCore.Collections.Products, "insert").and.returnValue(1);

      expect(function() {
        return Meteor.call("flushTranslations");
      }).not.toThrow(new Meteor.Error(403, "Access Denied"));

      expect(productSpy).toHaveBeenCalled();
      return done();

    });*/
  });

  // test various product meta data
  describe("meta data", function () {
    it("url should be product/example-product", function () {
      let route = Router.current().url;
      expect(route).toContain("product/example-product");
    });
    // waitForElement doesn't play nice with these next two cases
    it("should have meta:description", function () {
      expect($("meta[name='description']").attr("content")).not.toBeUndefined();
    });

    it("should have meta itemprop:description", function () {
      waitForElement($("meta[property='itemprop:description']"), function () {
        expect($("meta[itemprop='description']").attr("content")).not.toBeUndefined();
      });
    });

    it("should have meta og:description", function () {
      waitForElement($("meta[property='og:description']"), function () {
        expect($("meta[property='og:description']").attr("content")).not.toBeUndefined();
      });
    });

    it("should have meta og:title", function () {
      waitForElement($("meta[property='og:title']"), function () {
        expect($("meta[property='og:title']").attr("content")).not.toBeUndefined();
      });
    });

    it("should have a title set to Example Product", function () {
      const product = ReactionCore.Collections.Products.findOne();
      expect($(".title .title").text().trim()).toEqual(product.title);
    });

    it("should have itemprop:price", function () {
      expect($("#price").text()).not.toBeUndefined();
    });

    it("should display product pricing", function () {
      expect($("div.currency-symbol").text()).not.toBeNull();
    });

    it("should have add-to-cart button", function () {
      expect($("#add-to-cart")).not.toBeNull();
    });
  });
});
