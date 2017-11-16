import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Factory } from "meteor/dburles:factory";
import Core from "./core";

describe("hasPermission", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("should return false when not passed any permissions", function () {
    sandbox.stub(Meteor, "userId", () => "random-user-id");
    const hasPermissions = Core.hasPermission();
    expect(hasPermissions).to.be.false;
  });

  it("should return false when `permissions` is an empty string", function () {
    sandbox.stub(Meteor, "userId", () => "random-user-id");
    const hasPermissions = Core.hasPermission("");
    expect(hasPermissions).to.be.false;
  });

  it("should return false when `permissions` is an empty array", function () {
    sandbox.stub(Meteor, "userId", () => "random-user-id");
    const hasPermissions = Core.hasPermission([]);
    expect(hasPermissions).to.be.false;
  });

  it("should return false for users that don't have the `owner` permission", function () {
    const registeredUser = Factory.create("registeredUser");
    sandbox.stub(Meteor, "userId", () => registeredUser._id);
    const hasPermissions = Core.hasPermission(["owner"]);
    expect(hasPermissions).to.be.false;
  });

  it("should return true for anonymous users when `permissions === ['anonymous', 'guest']`", function () {
    const user = Factory.create("anonymous");
    sandbox.stub(Meteor, "userId", () => user._id);

    // It is necessary to explicity supply shopId to the Core.hasPermission call
    // below. If we don't, the said function defaults to using Core.getShopId
    // which, when this test is run, will give a shop ID that will be different
    // from the one used by Factory.create("anonymous").
    const shopId = Object.keys(user.roles)[0];
    const hasPermissions = Core.hasPermission(["anonymous", "guest"], user._id, shopId);
    expect(hasPermissions).to.be.true;
  });

  it("should return true for registered users when `permissions === ['account/profile', 'guest']`", function () {
    const user = Factory.create("registeredUser");
    sandbox.stub(Meteor, "userId", () => user._id);

    // It is necessary to explicity supply shopId to the Core.hasPermission call
    // below. If we don't, the said function defaults to using Core.getShopId
    // which, when this test is run, will give a shop ID that will be different
    // from the one used by Factory.create("registeredUser").
    const shopId = Object.keys(user.roles)[0];
    const hasPermissions = Core.hasPermission(["account/profile", "guest"], user._id, shopId);
    expect(hasPermissions).to.be.true;
  });
});
