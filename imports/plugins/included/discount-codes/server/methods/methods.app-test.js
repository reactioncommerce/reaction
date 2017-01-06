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

  describe("discounts/addCode", function () {
    it("should throw 403 error with discounts permission", function (done) {
      sandbox.stub(Roles, "userIsInRole", () => false);
      // this should actually trigger a whole lot of things
      expect(() => Meteor.call("discounts/addCode", code)).to.throw(Meteor.Error, /Access Denied/);
      return done();
    });
    // admin user
    it("should add code when user has role", function (done) {
      sandbox.stub(Roles, "userIsInRole", () => true);
      const discountInsertSpy = sandbox.spy(Discounts, "insert");
      const discountId = Meteor.call("discounts/addCode", code);
      expect(discountInsertSpy).to.have.been.called;

      Meteor._sleepForMs(500);
      const discountCount = Discounts.find(discountId).count();
      expect(discountCount).to.equal(1);
      return done();
    });
  });
});
