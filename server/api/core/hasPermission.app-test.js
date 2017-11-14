import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Factory } from "meteor/dburles:factory";
import Core from "./core";

describe.only("hasPermission", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it.only("should return false when not passed any permissions", function () {
    sandbox.stub(Meteor, "userId", () => "random-user-id");
    const hasPermissions = Core.hasPermission();
    expect(hasPermissions).to.be.false;
  });

  it.only("should return false when `permissions` is an empty string", function () {
    sandbox.stub(Meteor, "userId", () => "random-user-id");
    const hasPermissions = Core.hasPermission("");
    expect(hasPermissions).to.be.false;
  });

  it.only("should return false when `permissions` is an empty array", function () {
    sandbox.stub(Meteor, "userId", () => "random-user-id");
    const hasPermissions = Core.hasPermission([]);
    expect(hasPermissions).to.be.false;
  });

  it.only("should return false for anonymous users when `permissions === [owner]`", function () {
    const anonymousUser = Factory.create("anonymous");
    sandbox.stub(Meteor, "userId", () => anonymousUser._id);
    const hasPermissions = Core.hasPermission(["owner"]);
    expect(hasPermissions).to.be.false;
  });

  it.only("should return false for registered users when `permissions === [owner]`", function () {
    const user = Factory.create("registeredUser");
    sandbox.stub(Meteor, "userId", () => user._id);
    const hasPermissions = Core.hasPermission(["owner"]);
    expect(hasPermissions).to.be.false;
  });

  it.only("should return true for anonymous users when `permissions === ['anonymous', 'guest']`", function () {
    const user = Factory.create("anonymous");
    sandbox.stub(Meteor, "userId", () => user._id);
    const hasPermissions = Core.hasPermission(["anonymous", "guest"]);
    expect(hasPermissions).to.be.true;
  });

  it.only("should return true for registered users when `permissions === ['account/profile', 'guest']`", function () {
    const user = Factory.create("registeredUser");
    sandbox.stub(Meteor, "userId", () => user._id);
    const hasPermissions = Core.hasPermission(["account/profile", "guest"]);
    expect(hasPermissions).to.be.true;
  });
});
