/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections";

const code = {
  discount: 12,
  label: "Discount 5",
  description: "Discount by 5%",
  discountMethod: "code",
  code: "promocode"
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
    it("should delete rate with discounts permission", function () {
      this.timeout(15000);
      sandbox.stub(Roles, "userIsInRole", () => true);
      const discountInsertSpy = sandbox.spy(Discounts, "insert");
      const discountId = Meteor.call("discounts/addCode", code);
      expect(discountInsertSpy).to.have.been.called;

      Meteor.call("discounts/deleteRate", discountId);
      const discountCount = Discounts.find(discountId).count();
      expect(discountCount).to.equal(0);
    });
  });
});
