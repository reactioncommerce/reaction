import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";

let paymentMethod = {
  processor: "Generic",
  storedCard: "Visa 4242",
  status: "captured",
  mode: "authorize",
  createdAt: new Date()
};


describe.skip("GenericAPI", function () {

  it("should return data from ThirdPartyAPI authorize", function (done) {
    let cardData = {
      name: "Test User",
      number: "4242424242424242",
      expireMonth: "2",
      expireYear: "2018",
      cvv2: "123",
      type: "visa"
    };
    let paymentData = {
      currency: "USD",
      total: "19.99"
    };

    let transactionType = "authorize";
    let transaction = GenericAPI.methods.authorize.call({
      transactionType: transactionType,
      cardData: cardData,
      paymentData: paymentData
    });

    expect(transaction).not.toBe(undefined);
    done();
  });

  it("should return data from ThirdPartAPI capture", function (done) {
    let authorizationId = "abc123";
    let amount = 19.99;
    let results = GenericAPI.methods.capture.call({
      authorizationId: authorizationId,
      amount: amount
    });
    expect(results).not.toBe(undefined);
    done();
  });
});


describe.skip("Submit payment", function () {
  afterEach(function () {
    spyEnv.clearSpies();
  });

  it("should call Generic API with card and payment data", function (done) {
    let cardData = {
      name: "Test User",
      number: "4242424242424242",
      expireMonth: "2",
      expireYear: "2018",
      cvv2: "123",
      type: "visa"
    };
    let paymentData = {
      currency: "USD",
      total: "19.99"
    };

    let authorizeResult = {
      saved: true,
      currency: "USD"
    };

    spyOn(GenericAPI.methods.authorize, "call").and.returnValue(authorizeResult);
    let results = Meteor.call("genericSubmit", "authorize", cardData, paymentData);
    expect(GenericAPI.methods.authorize.call).toHaveBeenCalledWith({
      transactionType: "authorize",
      cardData: cardData,
      paymentData: paymentData
    });

    expect(results.saved).toBe(true);
    done();
  });

  it("should throw an error if card data is not correct", function (done) {
    let badCardData = {
      name: "Test User",
      cvv2: "123",
      type: "visa"
    };

    let paymentData = {
      currency: "USD",
      total: "19.99"
    };

    // Notice how you need to wrap this call in another function
    expect(function () {
      Meteor.call("genericSubmit", "authorize", badCardData, paymentData);
    }
    ).toThrow();
    done();
  });
});

describe.skip("Capture payment", function () {
  afterEach(function () {
    spyEnv.clearSpies();
  });

  it("should call GenericAPI with transaction ID", function (done) {
    let captureResults = { success: true };
    let authorizationId = "abc1234";
    paymentMethod.transactionId = authorizationId;
    paymentMethod.amount = 19.99;

    spyOn(GenericAPI.methods.capture, "call").and.returnValue(captureResults);
    let results = Meteor.call("generic/payment/capture", paymentMethod);
    expect(GenericAPI.methods.capture.call).toHaveBeenCalledWith({
      authorizationId: authorizationId,
      amount: 19.99
    });
    expect(results.saved).toBe(true);

    done();
  });

  it("should throw an error if transaction ID is not found", function (done) {
    spyOn(GenericAPI.methods, "capture").and.callFake(function () {
      throw new Meteor.Error("Not Found");
    });

    expect(function () {
      Meteor.call("generic/payment/capture", "abc123");
    }).toThrow();
    done();
  });
});

describe.skip("Refund", function () {
  afterEach(function () {
    spyEnv.clearSpies();
  });

  it("should call GenericAPI with transaction ID", function (done) {
    let refundResults = { success: true };
    let transactionId = "abc1234";
    let amount = 19.99;
    paymentMethod.transactionId = transactionId;
    spyOn(GenericAPI.methods.refund, "call").and.returnValue(refundResults);
    Meteor.call("generic/refund/create", paymentMethod, amount);
    expect(GenericAPI.methods.refund.call).toHaveBeenCalledWith({
      transactionId: transactionId,
      amount: amount
    });
    done();
  });

  it("should throw an error if transaction ID is not found", function (done) {
    spyOn(GenericAPI.methods.refund, "call").and.callFake(function () {
      throw new Meteor.Error("404", "Not Found");
    });

    let transactionId = "abc1234";
    paymentMethod.transactionId =  transactionId;
    expect(function () {
      Meteor.call("generic/refund/create", paymentMethod, 19.99);
    }).toThrow(new Meteor.Error("404", "Not Found"));
    done();
  });
});

describe.skip("List Refunds", function () {
  afterEach(function () {
    spyEnv.clearSpies();
  });

  it("should call GenericAPI with transaction ID", function (done) {
    let refundResults = { success: true };
    let refundArgs = {
      transactionId: "abc1234",
      amount: 19.99
    };
    spyOn(GenericAPI.methods.refund, "call").and.returnValue(refundResults);
    Meteor.call("generic/refund/list", transactionId);
    expect(GenericAPI.methods.refund.call).toHaveBeenCalledWith(refundArgs);
    done();
  });

  it("should throw an error if transaction ID is not found", function (done) {
    spyOn(GenericAPI.methods, "refunds").and.callFake(function () {
      throw new Meteor.Error("404", "Not Found");
    });

    expect(function () {
      Meteor.call("generic/refund/list", "abc123", 19.99);
    }).toThrow(new Meteor.Error("404", "Not Found"));
    done();
  });
});

