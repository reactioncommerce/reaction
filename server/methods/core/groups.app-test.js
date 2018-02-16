/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Reaction } from "/server/api";
import { Accounts, Groups } from "/lib/collections";
import Fixtures from "/server/imports/fixtures";
import { getUser } from "/server/imports/fixtures/users";

Fixtures();

describe("Group test", function () {
  let methods;
  let sandbox;
  let shop;
  let user;
  const sampleGroup = {
    name: "Shop Manager",
    permissions: ["sample-role1", "sample-role2"]
  };

  const sampleCustomerGroup = {
    name: "Customer",
    slug: "customer",
    permissions: ["guest", "account/profile", "product", "tag", "index", "cart/checkout", "cart/completed"]
  };

  before(function () {
    methods = {
      createGroup: Meteor.server.method_handlers["group/createGroup"],
      addUser: Meteor.server.method_handlers["group/addUser"],
      updateGroup: Meteor.server.method_handlers["group/updateGroup"],
      removeUser: Meteor.server.method_handlers["group/removeUser"]
    };
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    shop = Factory.create("shop");
    user = getUser();
    // make the same user on Meteor.users available on Accounts
    Accounts.upsert({ _id: user._id }, { $set: { userId: user._id } });
  });

  afterEach(function () {
    Groups.remove({});
    sandbox.restore();
    Meteor.users.remove({});
    Factory.create("shop");
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `group/${method}`, function (...args) {
      check(args, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return methods[method].apply(this, args);
    });
  }

  it("should create a group for a particular existing shop", function () {
    sandbox.stub(Reaction, "hasPermission", () => true);
    spyOnMethod("createGroup", shop._id);

    Meteor.call("group/createGroup", sampleGroup, shop._id);
    const group = Groups.findOne({ shopId: shop._id });

    expect(group.name).to.equal(sampleGroup.name);
  });

  it("should ensure one group type per shop", function () {
    sandbox.stub(Reaction, "hasPermission", () => true);
    spyOnMethod("createGroup", shop._id);

    Meteor.call("group/createGroup", sampleGroup, shop._id);

    expect(() => {
      Meteor.call("group/createGroup", sampleGroup, shop._id);
    }).to.throw(Meteor.Error, /Group already exist for this shop/);
  });

  it("should check admin access before creating a group", function () {
    sandbox.stub(Reaction, "hasPermission", () => false);
    spyOnMethod("createGroup", shop._id);

    function createGroup() {
      return Meteor.call("group/createGroup", sampleGroup, shop._id);
    }

    expect(createGroup).to.throw(Meteor.Error, /Access Denied/);
  });

  it("should add a user to a group successfully and reference the id on the user account", function () {
    sandbox.stub(Reaction, "hasPermission", () => true);
    sandbox.stub(Reaction, "canInviteToGroup", () => true);
    spyOnMethod("createGroup", shop._id);
    spyOnMethod("addUser", shop._id);

    Meteor.call("group/createGroup", sampleGroup, shop._id);
    const group = Groups.findOne({ shopId: shop._id });
    Meteor.call("group/addUser", user._id, group._id);
    const updatedUser = Accounts.findOne({ _id: user._id });
    expect(updatedUser.groups).to.include.members([group._id]);
  });

  it("should add a user to a group and update user's permissions", function () {
    sandbox.stub(Reaction, "hasPermission", () => true);
    sandbox.stub(Reaction, "canInviteToGroup", () => true);
    spyOnMethod("createGroup", shop._id);
    spyOnMethod("addUser", shop._id);

    Meteor.call("group/createGroup", sampleGroup, shop._id);
    const group = Groups.findOne({ shopId: shop._id });
    Meteor.call("group/addUser", user._id, group._id);
    const updatedUser = Meteor.users.findOne({ _id: user._id });

    expect(updatedUser.roles[shop._id]).to.include.members(sampleGroup.permissions);
  });

  it("should remove a user from a group and update user's permissions to default customer", function () {
    sandbox.stub(Reaction, "hasPermission", () => true);
    sandbox.stub(Reaction, "canInviteToGroup", () => true);
    spyOnMethod("createGroup", shop._id);
    spyOnMethod("addUser", shop._id);
    spyOnMethod("removeUser", shop._id);

    Meteor.call("group/createGroup", sampleGroup, shop._id);
    Meteor.call("group/createGroup", sampleCustomerGroup, shop._id);
    const group = Groups.findOne({ shopId: shop._id });
    Meteor.call("group/addUser", user._id, group._id);
    let updatedUser = Meteor.users.findOne({ _id: user._id });
    expect(updatedUser.roles[shop._id]).to.include.members(sampleGroup.permissions);

    Meteor.call("group/removeUser", user._id, group._id);
    updatedUser = Meteor.users.findOne({ _id: user._id });
    expect(updatedUser.roles[shop._id]).to.include.members(sampleCustomerGroup.permissions);
  });

  it("should ensure a user's permissions does not include roles from previous group", function () {
    sandbox.stub(Reaction, "hasPermission", () => true);
    sandbox.stub(Reaction, "canInviteToGroup", () => true);
    spyOnMethod("createGroup", shop._id);
    spyOnMethod("addUser", shop._id);
    spyOnMethod("updateGroup", shop._id);

    const response = Meteor.call("group/createGroup", sampleGroup, shop._id);
    const res = Meteor.call(
      "group/createGroup",
      { name: "Managers", permissions: ["sample-role3"] },
      shop._id
    );

    Meteor.call("group/addUser", user._id, response.group._id);
    let updatedUser = Meteor.users.findOne({ _id: user._id });
    expect(updatedUser.roles[shop._id]).to.include.members(sampleGroup.permissions);

    Meteor.call("group/addUser", user._id, res.group._id);
    updatedUser = Meteor.users.findOne({ _id: user._id });

    expect(updatedUser.roles[shop._id]).to.not.include.members(sampleGroup.permissions);
  });

  it("should ensure a user's permissions get updated when the group permissions changes", function () {
    sandbox.stub(Reaction, "hasPermission", () => true);
    sandbox.stub(Reaction, "canInviteToGroup", () => true);
    spyOnMethod("createGroup", shop._id);
    spyOnMethod("addUser", shop._id);
    spyOnMethod("updateGroup", shop._id);

    Meteor.call("group/createGroup", sampleGroup, shop._id);
    const group = Groups.findOne({ shopId: shop._id });
    Meteor.call("group/addUser", user._id, group._id);
    let updatedUser = Meteor.users.findOne({ _id: user._id });
    expect(updatedUser.roles[shop._id]).to.include.members(sampleGroup.permissions);

    const newGroupData = Object.assign({}, sampleGroup, { permissions: ["new-permissions"] });
    Meteor.call("group/updateGroup", group._id, newGroupData, shop._id);
    updatedUser = Meteor.users.findOne({ _id: user._id });
    expect(updatedUser.roles[shop._id]).to.include.members(newGroupData.permissions);
  });


  it("should add permissions for users in a group when roles are added", function () {
    this.timeout(10000);
    sandbox.stub(Reaction, "hasPermission", () => true);
    sandbox.stub(Reaction, "canInviteToGroup", () => true);
    spyOnMethod("createGroup", shop._id);
    spyOnMethod("addUser", shop._id);

    Meteor.call("group/createGroup", sampleCustomerGroup, shop._id);
    const group = Groups.findOne({ shopId: shop._id });
    Meteor.call("group/addUser", user._id, group._id);
    let updatedUser = Meteor.users.findOne({ _id: user._id });
    expect(updatedUser.roles[shop._id]).to.include.members(sampleCustomerGroup.permissions);

    Reaction.addRolesToGroups({ shops: [shop._id], roles: ["test-updated-role"], groups: ["customer"] });
    updatedUser = Meteor.users.findOne({ _id: user._id });
    expect(updatedUser.roles[shop._id]).to.contain("test-updated-role");
  });

  it("should add permissions for users in a group when roles are added to all shops", function () {
    this.timeout(10000);
    sandbox.stub(Reaction, "hasPermission", () => true);
    sandbox.stub(Reaction, "canInviteToGroup", () => true);
    spyOnMethod("createGroup", shop._id);
    spyOnMethod("addUser", shop._id);

    Meteor.call("group/createGroup", sampleCustomerGroup, shop._id);
    const group = Groups.findOne({ shopId: shop._id });
    Meteor.call("group/addUser", user._id, group._id);
    let updatedUser = Meteor.users.findOne({ _id: user._id });
    expect(updatedUser.roles[shop._id]).to.include.members(sampleCustomerGroup.permissions);

    Reaction.addRolesToGroups({ allShops: true, shops: [], roles: ["test-updated-role"], groups: ["customer"] });
    updatedUser = Meteor.users.findOne({ _id: user._id });
    expect(updatedUser.roles[shop._id]).to.contain("test-updated-role");
  });
});
