describe("Checkout", function() {
  var checkoutState = function (callback) {
    if (callback) {
      var cartId = ReactionCore.Collections.Cart.findOne()._id;
      cartWorkflow = ReactionCore.Collections.Cart.findOne(cartId).workflow;
      Tracker.afterFlush(callback);
    }
  };
  var originalTimeout;

  beforeEach(waitForRouter);
  beforeEach(function(done) {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

    Meteor.autorun(function (c) {
    var status = ReactionCore.Collections.Cart.findOne().workflow.status;
      if (status) {
        c.stop();
        checkoutState(done);
      }
    });

    spyOn(ReactionCore.Collections.Cart, "update");

    Router.go('/checkout');
    Tracker.afterFlush(done);
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  describe("checkoutLogin", function(done) {

    it("should goto first checkout workflow step", function(done) {

      //console.log("first step go to checkout url: ", cartWorkflow.status);

      expect(Router.current().url).toEqual("/checkout");
      done();
    });

    it("should continue as a guest user", function(done) {
      if (cartWorkflow.status === "checkoutLogin") {

        //console.log("first step go to checkout url: ", cartWorkflow.status);

        var guestGo = $('.continue-guest');
        $('.continue-guest').trigger('click');

        expect(guestGo).toHandle("click");
        expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
      } else {
        expect(cartWorkflow.status).not.toEqual("new");
      }
      done();
    });

  });

  describe("checkoutAddressBook", function(done) {

    it("should add primary address to addressBook", function() {

      //console.log("add new addressBook: ", cartWorkflow.status);

      if (cartWorkflow.status === "checkoutAddressBook") {
        expect(cartWorkflow.status).toEqual("checkoutAddressBook");
        var fakeAddress = faker.reaction.address();

        $('select[name="country"]').val(fakeAddress.country);
        $('input[name="fullName"]').focus();
        $('input[name="fullName"]').val(fakeAddress.fullName);
        $('input[name="address1"]').val(fakeAddress.address1);
        $('input[name="address2"]').val(fakeAddress.address2);
        $('input[name="city"]').val(fakeAddress.city);
        $('input[name="postal"]').val(fakeAddress.postal);
        $('input[name="region"]').val(fakeAddress.region);
        $('input[name="phone"]').val(fakeAddress.phone);



        $('*[data-event-action="saveAddress"]').trigger("click");
        expect($('*[data-event-action="saveAddress"]')).toHandle("click");

        /*$('#addressBookAddForm').submit();
        expect($('#addressBookAddForm')).toHandle("submit");*/

        expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
      } else {
        expect(cartWorkflow.status).not.toEqual("checkoutLogin");
      }
    });

    it("should add secondary address to addressBook", function() {
      console.log("add secondary addressBook: ", cartWorkflow.status);
      // if addressbook has succeeded at least once
      // console.log(cartWorkflow.workflow);
      // console.log(cartWorkflow.workflow.indexOf("checkoutAddressBook"));

      if (cartWorkflow.workflow.indexOf("checkoutAddressBook") > 1) {
        var fakeAddress = faker.reaction.address();

        $('*[data-action="addNewAddress"]').trigger("click");
        expect($('*[data-action="addNewAddress"]')).toHandle("click");

        $('select[name="country"]').val(fakeAddress.country);
        $('input[name="fullName"]').focus();

        $('input[name="fullName"]').val(fakeAddress.fullName);
        $('input[name="address1"]').val(fakeAddress.address1);
        $('input[name="address2"]').val(fakeAddress.address2);
        $('input[name="city"]').val(fakeAddress.city);
        $('input[name="postal"]').val(fakeAddress.postal);
        $('input[name="region"]').val(fakeAddress.region);
        $('input[name="phone"]').val(fakeAddress.phone);

        $('#addressBookAddForm').submit();
        expect($('#addressBookAddForm')).toHandle("submit");

        expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
      } else {
        expect(cartWorkflow.workflow.indexOf("checkoutAddressBook")).toBeTruthy();
      }


    });

    it("should select address for shipping", function() {
      if (cartWorkflow.status === "checkoutAddressBook") {

        //console.log("select shipto: ", cartWorkflow.status);

        var primaryAddress = $('.list-group .address-ship-to:first-child');

        $('.list-group .address-ship-to:first-child').trigger('click');

        expect(primaryAddress).toHandle('click');
        expect($('.address-ship-to .list-group-item .active')).toExist();
        expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();

      } else {

        expect(cartWorkflow.status).not.toEqual("checkoutLogin");
      }

    });

  });


  describe("coreCheckoutShipping", function() {
    it("should select Standard shipping method", function() {
      if (cartWorkflow.status === "coreCheckoutShipping") {

        //console.log("select shipping: ", cartWorkflow.status);

        var standardShipping = $('.checkout-shipping .list-group-item:nth-child(2)');

        standardShipping.trigger('click');

        expect(standardShipping).toHandle('click');
        /*expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();*/
      }
    });

  });
});
