function checkoutState(callback) {
  if (callback) {
    let cartId = ReactionCore.Collections.Cart.findOne()._id;
    cartWorkflow = ReactionCore.Collections.Cart.findOne(cartId).workflow;
    Tracker.afterFlush(callback);
  }
}

describe("Checkout", function () {
  beforeEach(function (done) {
    spyOn(ReactionCore.Collections.Cart, "update");

    Meteor.autorun(function (c) {
      let status = ReactionCore.Collections.Cart.findOne().workflow.status;
      if (status) {
        c.stop();
        checkoutState(done);
      }
    });

    Router.go("/checkout");
    Tracker.afterFlush(done);
  });

  beforeEach(waitForRouter);

  describe("checkoutLogin", function () {
    it("should go to checkout route", function (done) {
      expect(Router.current().url).toEqual("/checkout");
      done();
    });

    it("should display i18n empty checkout msg if no products", function (done) {
      expect(Router.current().url).toEqual("/checkout");

      let cartItems = ReactionCore.Collections.Cart.findOne().items;

      if (!cartItems) {
        expect($("*[data-i18n='cartCheckout.emptyCheckoutCart']")).toHaveText(
          "looks like your cart is empty!");
      } else {
        expect($("*[data-i18n='cartCheckout.emptyCheckoutCart']")).not.toExist();
      }

      done();
    });

    it("should display guest user login", function (done) {
      expect(Router.current().url).toEqual("/checkout");

      let thisStep = cartWorkflow.status === "checkoutLogin" || cartWorkflow.status === "new";
      let thisWorkflow = _.contains(cartWorkflow.workflow, "checkoutLogin");
      // if this step is already process, we expect the workflow.workflow
      // to already contain this step, and not to see the login flow
      if (thisStep && !thisWorkflow) {
        expect($(".continue-guest")).toExist();
      } else {
        expect(cartWorkflow.workflow).toContain("checkoutLogin");
      }
      done();
    });

    it("should continue as a guest user", function (done) {
      expect(Router.current().url).toEqual("/checkout");

      let thisStep = cartWorkflow.status === "checkoutLogin" || cartWorkflow.status === "new";
      let thisWorkflow = _.contains(cartWorkflow.workflow, "checkoutLogin");

      if (thisStep && !thisWorkflow) {
        let guestGo = $(".continue-guest");
        // test guest login button
        $(".continue-guest").trigger("click");

        expect(guestGo).toHandle("click");
        expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
      } else {
        expect(cartWorkflow.workflow).toContain("checkoutLogin");
      }
      done();
    });
  });

  describe("checkoutAddressBook", function () {
    it("should add primary address to addressBook", function () {
      expect(Router.current().url).toEqual("/checkout");

      let thisStep = cartWorkflow.status === "checkoutAddressBook";
      let thisWorkflow = _.contains(cartWorkflow.workflow, "checkoutAddressBook");
      // let spyOnSaveButton = spyOnEvent($("*[data-event-action='saveAddress']", "click"));

      if (thisStep === true && thisWorkflow === false) {
        expect(cartWorkflow.status).toEqual("checkoutAddressBook");
        let fakeAddress = faker.reaction.address();

        $("*[data-event-action='addNewAddress']").trigger("click");

        $("select[name='country']").val(fakeAddress.country);
        $("input[name='fullName']").focus();
        $("input[name='fullName']").val(fakeAddress.fullName);
        $("input[name='address1']").val(fakeAddress.address1);
        $("input[name='address2']").val(fakeAddress.address2);
        $("input[name='city']").val(fakeAddress.city);
        $("input[name='postal']").val(fakeAddress.postal);
        $("input[name='region']").val(fakeAddress.region);
        $("input[name='phone']").val(fakeAddress.phone);

        $("*[data-event-action='saveAddress']").trigger("click");
        // expect(spyOnSaveButton).toHaveBeenTriggered();
        // expect($("*[data-event-action="saveAddress"]")).toHandle("click");
        // expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
      } else {
        expect(cartWorkflow.workflow).not.toContain("checkoutAddressBook");
      }
    });

    it("should add secondary address to addressBook", function () {
      expect(Router.current().url).toEqual("/checkout");

      let thisWorkflow = _.contains(cartWorkflow.workflow, "checkoutAddressBook");
      // if addressbook has succeeded at least once
      if (thisWorkflow && cartWorkflow.workflow.indexOf("checkoutAddressBook") > 1) {
        ReactionCore.Log.info("add secondary addressBook: ", cartWorkflow.status);
        let fakeAddress = faker.reaction.address();

        $("*[data-event-action='addNewAddress']").trigger("click");
        expect($("*[data-event-action='addNewAddress']")).toHandle("click");

        $("select[name='country']").val(fakeAddress.country);
        $("input[name='fullName']").focus();
        $("input[name='fullName']").val(fakeAddress.fullName);
        $("input[name='address1']").val(fakeAddress.address1);
        $("input[name='address2']").val(fakeAddress.address2);
        $("input[name='city']").val(fakeAddress.city);
        $("input[name='postal']").val(fakeAddress.postal);
        $("input[name='region']").val(fakeAddress.region);
        $("input[name='phone']").val(fakeAddress.phone);

        $("#addressBookAddForm").submit();
        expect($("#addressBookAddForm")).toHandle("submit");

        expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
      } else {
        expect(cartWorkflow.workflow.indexOf("checkoutAddressBook")).toBeTruthy();
      }
    });

    it("should select address for shipping", function () {
      expect(Router.current().url).toEqual("/checkout");

      let thisStep = cartWorkflow.status === "checkoutAddressBook";
      let thisWorkflow = _.contains(cartWorkflow.workflow, "checkoutAddressBook");

      if (thisStep && thisWorkflow) {
        let primaryAddress = $(".list-group .address-ship-to:first-child");

        $(".list-group .address-ship-to:first-child").trigger("click");

        expect($(primaryAddress)).toHaveBeenTriggeredOn("click");
        expect($(".address-ship-to .list-group-item .active")).toExist();
        expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
      } else {
        expect(cartWorkflow.workflow).not.toContain("checkoutAddressBook");
      }
    });
  });

  describe("coreCheckoutShipping", function () {
    it("should select Standard shipping method", function () {
      let thisStep = cartWorkflow.status === "coreCheckoutShipping";
      let thisWorkflow = _.contains(cartWorkflow.workflow, "coreCheckoutShipping");

      if (thisStep || thisWorkflow) {
        let standardShipping = $(".checkout-shipping .list-group-item:nth-child(2)");

        $(".checkout-shipping .list-group-item:nth-child(2)").trigger("click");

        expect(standardShipping).toHandle("click");
        expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
      } else {
        expect(cartWorkflow.workflow).not.toContain("coreCheckoutShipping");
      }
    });
  });
});
