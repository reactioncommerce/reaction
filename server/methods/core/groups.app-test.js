import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Reaction } from "/server/api";
import { Accounts, Shops } from "/lib/collections";

describe("Group test", function () {
  let methods;
  let sandbox;
  let shop;
  let user;
  const payload = {
    group: {
      name: "Shop Manager",
      permissions: ["sample-role1", "sample-role2"]
    }
  };

  before(function (done) {
    methods = {
      createGroup: Meteor.server.method_handlers["group/createGroup"],
      addUser: Meteor.server.method_handlers["group/addUser"]
    };
    return done();
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    shop = Factory.create("shop");
    user = Factory.create("account");
  });

  afterEach(function (done) {
    Shops.remove({});
    sandbox.restore();
    return done();
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `group/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return methods[method].apply(this, arguments);
    });
  }

  it("should create a group for a particular existing shop", function () {
    sandbox.stub(Reaction, "hasPermission", () => true);
    spyOnMethod("createGroup", shop._id);

    Meteor.call("group/createGroup", payload.group, shop._id);
    const updatedShop = Shops.findOne({ _id: shop._id });

    expect(updatedShop.groups[0].name).to.equal(payload.group.name);
  });

  it("should check admin access before creating a group", function () {
    sandbox.stub(Reaction, "hasPermission", () => false);
    spyOnMethod("createGroup", shop._id);

    function createGroup() {
      return Meteor.call("group/createGroup", payload.group, shop._id);
    }

    expect(createGroup).to.throw(Meteor.Error, /Access Denied/);
  });

  it("should add a user to a group successfully and reference the id on the user account", function () {
    sandbox.stub(Reaction, "hasPermission", () => true);
    spyOnMethod("createGroup", shop._id);
    spyOnMethod("addUser", shop._id);

    Meteor.call("group/createGroup", payload.group, shop._id);
    const updatedShop = Shops.findOne({ _id: shop._id });
    const groupData = updatedShop.groups[0];
    Meteor.call("group/addUser", user._id, groupData, shop._id);
    const updatedUser = Accounts.findOne({ _id: user._id });
    expect(updatedUser.groups[0].groupId[0]).to.equal(groupData._id);
  });
});
