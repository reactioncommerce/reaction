describe("Checkout", function() {
  var fakeAddress = {
    fullName: Fake.word() + " " + Fake.word(),
    address1: _.random(0, 100) + " " + Fake.word(),
    address2: _.random(0, 100) + " " + Fake.word(),
    city: Fake.word(),
    company: Fake.word(),
    phone: _.random(0, 99999999999),
    region: "CA",
    postal: '90401-0000',
    country: 'US',
    isCommercial: false,
    isShippingDefault: true,
    isBillingDefault: true
  };

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
      var continueGuestButton = $('.continue-guest');
      var spyOnGuestCheckoutEvent = spyOnEvent(continueGuestButton, 'click');

      expect(cartStatus).toEqual("new");
      spyOn(ReactionCore.Collections.Cart, "update");

      $(continueGuestButton).trigger('click');
      // triggers Meteor.call("cart/setStatus", 'checkoutLogin')

      expect(spyOnGuestCheckoutEvent).toHaveBeenTriggered();
      expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
      done();
    });

    it("expect status to change from new to checkoutLogin", function(done) {
      /*expect(cartSpy).toHaveBeenCalled();*/
      expect(cartStatus).toEqual("checkoutLogin");
      done();
    });

  });

  describe("Addressbook", function() {
    beforeAll(function() {
      expect(cartStatus).not.toEqual("new");
      expect(cartStatus).not.toEqual("checkoutLogin");
    });

    it("should add address to addressBook", function(done) {
      console.log(cartStatus);
      $('select[name="country"]').val(fakeAddress.country);
      $('input[name="fullName"]').val(fakeAddress.fullName);
      $('input[name="address1"]').val(fakeAddress.address1);
      $('input[name="address2"]').val(fakeAddress.address2);
      $('input[name="city"]').val(fakeAddress.city);
      $('input[name="postal"]').val(fakeAddress.postal);
      $('input[name="region"]').val(fakeAddress.region);

      $('input[name="phone"]').val(fakeAddress.phone);

      $('#addressBookAddForm').submit();

      // expect(spyOnCartStatus).toHaveBeenCalled();
      // expect(spyOnCartStatus).toEqual("checkoutAddressBook");
      done();
    });
  });

});
