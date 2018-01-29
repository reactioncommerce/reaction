/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";

before(function () {
  this.timeout(10000);
  Meteor._sleepForMs(7000);
});

describe("taxes methods", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("taxes/deleteRate", function () {
    it("should throw 403 error with taxes permission", function (done) {
      sandbox.stub(Roles, "userIsInRole", () => false);
      // this should actually trigger a whole lot of things
      expect(() => Meteor.call("taxes/deleteRate", "dummystring")).to.throw(Meteor.Error, /Access Denied/);
      return done();
    });
  });
});
