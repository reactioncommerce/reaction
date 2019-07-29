/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

const code = {
  discount: 12,
  label: "Discount 5",
  description: "Discount by 5%",
  discountMethod: "code",
  code: "promocode"
};

describe("discount code methods", function () {
  let sandbox;

  before(function (done) {
    this.timeout(20000);

    Reaction.onAppStartupComplete(() => {
      done();
    });
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("discounts/addCode", function () {
    it("should throw 403 error with discounts permission", function () {
      sandbox.stub(Roles, "userIsInRole", () => false);
      // this should actually trigger a whole lot of things
      expect(() => Meteor.call("discounts/addCode", code)).to.throw(ReactionError, /Access Denied/);
    });

    // admin user
    it("should add code when user has role", function () {
      sandbox.stub(Roles, "userIsInRole", () => true);
      const discountInsertSpy = sandbox.spy(Discounts, "insert");
      const discountId = Meteor.call("discounts/addCode", code);
      expect(discountInsertSpy).to.have.been.called;

      const discountCount = Discounts.find(discountId).count();
      expect(discountCount).to.equal(1);
    });
  });

  describe("discounts/deleteCode", function () {
    it("should delete rate with discounts permission", function () {
      this.timeout(15000);
      sandbox.stub(Roles, "userIsInRole", () => true);
      const discountInsertSpy = sandbox.spy(Discounts, "insert");
      const discountId = Meteor.call("discounts/addCode", code);
      expect(discountInsertSpy).to.have.been.called;

      Meteor.call("discounts/deleteCode", discountId);
      const discountCount = Discounts.find(discountId).count();
      expect(discountCount).to.equal(0);
    });
  });
});
