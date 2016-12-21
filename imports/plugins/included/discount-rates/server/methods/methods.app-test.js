import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections";

before(function () {
  this.timeout(10000);
  Meteor._sleepForMs(7000);
});

describe("discount rate methods", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  const rate = {
    discount: 12,
    label: "Discount 5",
    description: "Discount by 5%",
    discountMethod: "rate"
  };

  describe("discounts/addRate", function () {
    it("should throw 403 error with discounts permission", function (done) {
      sandbox.stub(Roles, "userIsInRole", () => false);
      // this should actually trigger a whole lot of things
      expect(() => Meteor.call("discounts/addRate", rate)).to.throw(Meteor.Error, /Access Denied/);
      return done();
    });
    // admin user
    it("should add rate when user has role", function (done) {
      sandbox.stub(Roles, "userIsInRole", () => true);
      const discountInsertSpy = sandbox.spy(Discounts, "insert");
      const discountId = Meteor.call("discounts/addRate", rate);
      expect(discountInsertSpy).to.have.been.called;

      const discountCount = Discounts.find(discountId).count();
      Meteor._sleepForMs(500);
      expect(discountCount).to.equal(1);
      return done();
    });
  });
});
