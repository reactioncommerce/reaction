/*Product Detail Page Specs*/


  describe("Product Detail Page", function() {
    beforeAll(function (done) {
      Router.go('/product/example-product');
      Tracker.afterFlush(done);
    });

    beforeEach(waitForRouter);

    it('should have itemprop:price', function () {
      expect($('#price').text()).not.toBeUndefined();
    });

    it('should display product pricing', function() {
      expect($('div.currency-symbol').text()).not.toBeNull();
    });

    it("should have add-to-cart button", function() {
      expect($('#add-to-cart')).not.toBeNull();
    });

    describe("Add to cart", function() {
      beforeEach(function (done) {
        var cartId = ReactionCore.Collections.Cart.findOne()._id;
        // empty cart items before each test
        ReactionCore.Collections.Cart.update({_id: cartId}, {$set: {items: [] }});
        done();
      });

      it("should not add to cart without option selected", function() {
        // no option is selected yet
        $('#add-to-cart').trigger('click');
        // check alert
        expect($('#product-alerts div:first-child').text()).not.toBeNull();
      });

      it("should add selected option to cart", function() {
        var option1 = $('.variant-product-options .variant-select-option')[0];
        var addToCartButton = $('#add-to-cart');
        var cartIcon = $('.cart-icon .badge');
        var cartCount = $('.cart-icon .badge').text();

        var spyOnOptionEvent = spyOnEvent(option1, 'click');
        var spyOnAddToCartEvent = spyOnEvent(addToCartButton, 'click');

        $(option1).trigger('click');

        expect('click').toHaveBeenTriggeredOn(option1);
        expect(spyOnOptionEvent).toHaveBeenTriggered();

        $('#add-to-cart').trigger('click');
        expect(spyOnAddToCartEvent).toHaveBeenTriggered();
/*
        actualCount = ReactionCore.Collections.Cart.findOne().cartCount().toString();
        expect(cartCount).toBeGreaterThan(actualCount);
      */


      });

/*
      it("should let the quantity for selected option be changed", function() {
        spyOn(ReactionCore.Collections.Cart, "update");
        $('.variant-product-options .variant-select-option').trigger('click');
        // could be more random and handle failures
        $('#add-to-cart-quantity').val(22);

        $('#add-to-cart').trigger('click');

        expect($('.cart-icon .badge').text()).toEqual(22);

      });

      it("should throw an error if not enough quantity", function() {
        spyOn(ReactionCore.Collections.Cart, "update");
        $('.variant-product-options .variant-select-option').trigger('click');
        // could be more random and handle failures
        $('#add-to-cart-quantity').val(2002);
        $('#add-to-cart').trigger('click');
        expect($('.cart-icon .badge').text()).toBeLessThan(10);

        expect(ReactionCore.Collections.Cart.update).not.toHaveBeenCalled();
      });*/

    });

  });
