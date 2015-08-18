describe("Checkout", function() {
  beforeAll(function (done) {
    var cartId = ReactionCore.Collections.Cart.findOne()._id;
    ReactionCore.Collections.Cart.update( {_id: cartId}, {$set: {status: "new" }} );
    Router.go('/checkout');
    Tracker.afterFlush(done);
  });

  beforeEach(waitForRouter);

  afterEach(function (done) {
    cartStatus = ReactionCore.Collections.Cart.findOne().status;
    done();
  });

  describe("Guest", function() {
    it("should goto checkout", function(done) {
      expect(Router.current().url).toEqual("/checkout");
      done();
    });

    it("continue as a guest user", function(done) {
      var continueGuestButton = $('.continue-guest');
      var spyOnGuestCheckoutEvent = spyOnEvent(continueGuestButton, 'click');

      $(continueGuestButton).trigger('click');
      expect(spyOnGuestCheckoutEvent).toHaveBeenTriggered();
      done();
    });

    it("expect status to change from new to checkoutLogin", function(done) {
      expect(cartStatus).toEqual("checkoutLogin");
      done();
    });
  });

});
