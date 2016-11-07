import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";

before(function () {
  this.timeout(10000);
  Meteor._sleepForMs(7000);
});

describe("discount code methods", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("discounts/deleteRate", function () {
    it("should throw 403 error with discounts permission", function (done) {
      sandbox.stub(Roles, "userIsInRole", () => false);
      // this should actually trigger a whole lot of things
      expect(() => Meteor.call("discounts/addCode", "dummystring")).to.throw(Meteor.Error, /Access Denied/);
      return done();
    });
  });
});
