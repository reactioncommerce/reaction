/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections";

const rate = {
  discount: 12,
  label: "Discount 5",
  description: "Discount by 5%",
  discountMethod: "rate"
};

before(function () {
  this.timeout(15000);
});

describe("discount rate methods", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("discounts/addRate", function () {
    it("should throw 403 error with discounts permission", function () {
      sandbox.stub(Roles, "userIsInRole", () => false);
      // this should actually trigger a whole lot of things
      expect(() => Meteor.call("discounts/addRate", rate)).to.throw(Meteor.Error, /Access Denied/);
    });

    // admin user
    it("should add rate when user has role", function () {
      sandbox.stub(Roles, "userIsInRole", () => true);
      const discountInsertSpy = sandbox.spy(Discounts, "insert");
      const discountId = Meteor.call("discounts/addRate", rate);
      expect(discountInsertSpy).to.have.been.called;

      const discountCount = Discounts.find(discountId).count();
      expect(discountCount).to.equal(1);
    });
  });
});
