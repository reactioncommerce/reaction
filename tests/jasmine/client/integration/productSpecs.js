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
      spyOn(Products, "insert");

      Meteor.call("products/createProduct", function (error) {
        expect(error.error).toEqual(403);
      });

      expect(Products.insert).not.toHaveBeenCalled();
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
      expect($("title").text()).toEqual("REACTION | Example Product");
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

  // add to cart from pdp
  describe("Add to cart", function () {
    // empty cart items before each test
    afterEach(function (done) {
      let cartId = ReactionCore.Collections.Cart.findOne()._id;
      ReactionCore.Collections.Cart.update({
        _id: cartId
      }, {
        $set: {
          items: []
        }
      });
      done();
    });

    it("should not add to cart without option selected", function () {
      // no option is selected yet
      $("#add-to-cart").trigger("click");
      // check alert
      expect($("#product-alerts div:first-child").text()).not.toBeNull();
    });

    it("should add selected option to cart", function (done) {
      let option1 = $(".variant-product-options .variant-select-option")[0];
      let addToCartButton = $("#add-to-cart");
      // needs client stubs
      // let spyOnCart = spyOn(ReactionCore.Collections.Cart, "update").and.returnValue();
      let spyOnOptionEvent = spyOnEvent(option1, "click");
      let spyOnAddToCartEvent = spyOnEvent(addToCartButton, "click");
      // let cartCount = $(".cart-icon .badge").text();
      // let cartId = ReactionCore.Collections.Cart.findOne()._id;

      $(option1).trigger("click");
      expect("click").toHaveBeenTriggeredOn(option1);
      expect(spyOnOptionEvent).toHaveBeenTriggered();

      $(addToCartButton).trigger("click");
      expect(spyOnAddToCartEvent).toHaveBeenTriggered();
      // expect(spyOnCart).toHaveBeenCalled();
      done();
    });

    it("should let the quantity for selected option be changed", function () {
      let option1 = $(".variant-product-options .variant-select-option")[0];
      let addToCartButton = $("#add-to-cart");
      // let cartCount = $(".cart-icon .badge").text();

      let spyOnOptionEvent = spyOnEvent(option1, "click");
      let spyOnAddToCartEvent = spyOnEvent(addToCartButton, "click");

      $("#add-to-cart-quantity").val(22);
      $(option1).trigger("click");

      expect("click").toHaveBeenTriggeredOn(option1);
      expect(spyOnOptionEvent).toHaveBeenTriggered();

      $(addToCartButton).trigger("click");
      expect(spyOnAddToCartEvent).toHaveBeenTriggered();
    });

    it("should throw an error if not enough quantity", function () {
      let option1 = $(".variant-product-options .variant-select-option")[0];
      let addToCartButton = $("#add-to-cart");
      let cartCount = $(".cart-icon .badge").text();

      let spyOnOptionEvent = spyOnEvent(option1, "click");
      let spyOnAddToCartEvent = spyOnEvent(addToCartButton, "click");

      $("#add-to-cart-quantity").val(2002);
      $(option1).trigger("click");

      expect("click").toHaveBeenTriggeredOn(option1);
      expect(spyOnOptionEvent).toHaveBeenTriggered();

      $(addToCartButton).trigger("click");
      expect(spyOnAddToCartEvent).toHaveBeenTriggered();

      expect($(".cart-icon .badge").text()).toEqual(cartCount);
    });
  });

  // checkout from pdp
  describe("Checkout", function () {
    it("should not add to cart without variant/option selected", function () {
      // no option is selected yet
      $("#add-to-cart").trigger("click");
      // check alert
      expect($("#product-alerts div:first-child").text()).not.toBeNull();
    });

    it("should add selected variant/option   to cart", function () {
      let option1 = $(".variant-product-options .variant-select-option")[0];
      let addToCartButton = $("#add-to-cart");
      // let cartCount = $(".cart-icon .badge").text();
      let spyOnOptionEvent = spyOnEvent(option1, "click");
      let spyOnAddToCartEvent = spyOnEvent(addToCartButton, "click");

      $(option1).trigger("click");

      expect("click").toHaveBeenTriggeredOn(option1);
      expect(spyOnOptionEvent).toHaveBeenTriggered();

      $("#add-to-cart").trigger("click");
      expect(spyOnAddToCartEvent).toHaveBeenTriggered();
    });

    it("should goto checkout when checkout button clicked ", function (done) {
      let btnCheckout = $("#btn-checkout");
      let cartIcon = $(".cart-icon");

      let spyOnCheckoutButton = spyOnEvent(btnCheckout, "click");
      let spyOnCartIcon = spyOnEvent(cartIcon, "click");

      $(cartIcon).trigger("click");
      expect(spyOnCartIcon).toHaveBeenTriggered();

      $("#btn-checkout").trigger("click");
      expect(spyOnCheckoutButton).toHaveBeenTriggered();
      // expect(Router.current().url).toEqual("/checkout");
      done();
    });
  });
});
