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

describe("discounts methods", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("discounts/deleteRate", function () {
    // it("should not delete rate without permissions", function (done) {
    //   const roleStub = sandbox.stub(Roles, "userIsInRole", () => true);
    //   const discountInsertSpy = sandbox.spy(Discounts, "insert");
    //   const discountId = Meteor.call("discounts/addRate", rate);
    //   expect(discountInsertSpy).to.have.been.called;
    //   Meteor._sleepForMs(500);
    //
    //   sandbox.stub(Roles, "userIsInRole", () => false);
    //   Meteor.call("discounts/deleteRate", discountId);
    //   Meteor._sleepForMs(500);
    //
    //   const discountCount = Discounts.find(discountId).count();
    //   expect(discountCount).to.equal(1);
    //   return done();
    // });

    it("should delete rate with discounts permission", function (done) {
      this.timeout(15000);
      sandbox.stub(Roles, "userIsInRole", () => true);
      const discountInsertSpy = sandbox.spy(Discounts, "insert");
      const discountId = Meteor.call("discounts/addRate", rate);
      expect(discountInsertSpy).to.have.been.called;

      Meteor.call("discounts/deleteRate", discountId);
      Meteor._sleepForMs(500);

      const discountCount = Discounts.find(discountId).count();
      expect(discountCount).to.equal(0);
      return done();
    });
  });
});
