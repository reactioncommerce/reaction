describe("Checkout", function() {
  beforeAll(function (done) {
    var cartId = ReactionCore.Collections.Cart.findOne()._id;
    ReactionCore.Collections.Cart.update( {_id: cartId}, {$set: {status: "new", address: [] } } );
    ReactionCore.Collections.Accounts.update( {_id: Meteor.userId() }, {$set: { "profile..addressBook": [] } } );
    Router.go('/checkout');
    Tracker.afterFlush(done);
  });

  beforeEach(function() {
    cartStatus =  ReactionCore.Collections.Cart.findOne().status;
  });

  beforeEach(waitForRouter);

  describe("Login", function() {

    it("should goto first checkout workflow step", function(done) {
      expect(Router.current().url).toEqual("/checkout");
      done();
    });

    it("should continue as a guest user", function(done) {
      console.log(cartStatus);

      if (cartStatus == "new" || cartStatus == "checkoutLogin") {
        var continueGuestButton = $('.continue-guest');
        var spyOnGuestCheckoutEvent = spyOnEvent(continueGuestButton, 'click');

        spyOn(ReactionCore.Collections.Cart, "update");

        $(continueGuestButton).trigger('click');

        expect(spyOnGuestCheckoutEvent).toHaveBeenTriggered();
        expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
        done();
      } else {
        expect(cartStatus).not.toEqual("new");
        done();
      }
    });

  });

  describe("Addressbook", function() {

    it("should add address to addressBook", function(done) {
      var fakeAddress = faker.reaction.address();

      $('select[name="country"]').val(fakeAddress.country);
      $('input[name="fullName"]').val(fakeAddress.fullName);
      $('input[name="address1"]').val(fakeAddress.address1);
      $('input[name="address2"]').val(fakeAddress.address2);
      $('input[name="city"]').val(fakeAddress.city);
      $('input[name="postal"]').val(fakeAddress.postal);
      $('input[name="region"]').val(fakeAddress.region);

      $('input[name="phone"]').val(fakeAddress.phone);

      $('#addressBookAddForm').submit();

      done();
    });
  });

});
