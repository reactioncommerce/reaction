/* eslint prefer-arrow-callback:0 */
import { Factory } from "meteor/dburles:factory";
import { sinon } from "meteor/practicalmeteor:sinon";
import { expect } from "meteor/practicalmeteor:chai";
import { Shops, Groups } from "/lib/collections";
import { Reaction } from "/server/api";

describe("Server/API/Core", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("addDefaultRoles", () => {
    beforeEach(function () {
      return Shops.remove({});
    });

    it("should add a role to the default customer group for a specified shop", () => {
      const shop = Factory.create("shop");
      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });

      Reaction.addRolesToGroups({ shops: [shop._id], roles: ["test-role"], groups: ["customer"] });
      group = Groups.findOne({ slug: "customer", shopId: shop._id });

      expect(group.permissions).to.contain("test-role");
    });

    it("should add a role to default customer group for an array of shops", () => {
      const shop = Factory.create("shop");
      const shop2 = Factory.create("shop");
      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });
      let group2 = Factory.create("group", { shopId: shop2._id, slug: "customer" });

      Reaction.addRolesToGroups({ shops: [shop._id, shop2._id], roles: ["test-role2"], groups: ["customer"] });

      group = Groups.findOne({ slug: "customer", shopId: shop._id });
      group2 = Groups.findOne({ slug: "customer", shopId: shop2._id });
      expect(group.permissions).to.contain("test-role2");
      expect(group2.permissions).to.contain("test-role2");
    });

    it("should add a role to default customer group for all shops", () => {
      const shop = Factory.create("shop");
      const shop2 = Factory.create("shop");
      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });
      let group2 = Factory.create("group", { shopId: shop2._id, slug: "customer" });

      Reaction.addRolesToGroups({ allShops: true, roles: ["test-all-shops"], groups: ["customer"] });
      group = Groups.findOne({ slug: "customer", shopId: shop._id });
      group2 = Groups.findOne({ slug: "customer", shopId: shop2._id });
      expect(group.permissions).to.contain("test-all-shops");
      expect(group2.permissions).to.contain("test-all-shops");
    });

    it("should only add a role to the group of the specified shop", () => {
      const shop = Factory.create("shop");
      const shop2 = Factory.create("shop");
      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });
      let group2 = Factory.create("group", { shopId: shop2._id, slug: "customer" });

      Reaction.addRolesToGroups({ shops: [shop._id], roles: ["test-certain-shop"], groups: ["customer"] });

      group = Groups.findOne({ slug: "customer", shopId: shop._id });
      group2 = Groups.findOne({ slug: "customer", shopId: shop2._id });

      expect(group.permissions).to.contain("test-certain-shop");
      expect(group2.permissions).not.to.contain("test-certain-shop");
    });

    it("should not add any roles if no shops are specified", () => {
      const shop = Factory.create("shop");
      const shop2 = Factory.create("shop");
      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });
      let group2 = Factory.create("group", { shopId: shop2._id, slug: "customer" });

      Reaction.addRolesToGroups({ shops: [], roles: ["test-no-shop"], groups: ["customer"] });

      group = Groups.findOne({ slug: "customer", shopId: shop._id });
      group2 = Groups.findOne({ slug: "customer", shopId: shop2._id });

      expect(group.permissions).not.to.contain("test-certain-shop");
      expect(group2.permissions).not.to.contain("test-certain-shop");
    });

    it("should add multiple roles to the specified group a shop", () => {
      const shop = Factory.create("shop");
      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });

      Reaction.addRolesToGroups({ shops: [shop._id], roles: ["test1", "test2"], groups: ["customer"] });

      group = Groups.findOne({ slug: "customer", shopId: shop._id });

      expect(group.permissions).to.contain("test1");
      expect(group.permissions).to.contain("test2");
    });

    it("should add multiple roles to an array of specified shops", () => {
      const shop = Factory.create("shop");
      const shop2 = Factory.create("shop");
      const shop3 = Factory.create("shop");

      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });
      let group2 = Factory.create("group", { shopId: shop2._id, slug: "customer" });
      let group3 = Factory.create("group", { shopId: shop3._id, slug: "customer" });

      Reaction.addRolesToGroups({ shops: [shop._id, shop2._id], roles: ["test1", "test2"], groups: ["customer"] });

      group = Groups.findOne({ slug: "customer", shopId: shop._id });
      group2 = Groups.findOne({ slug: "customer", shopId: shop2._id });
      group3 = Groups.findOne({ slug: "customer", shopId: shop3._id });

      expect(group.permissions).to.contain("test1");
      expect(group.permissions).to.contain("test2");
      expect(group2.permissions).to.contain("test1");
      expect(group2.permissions).to.contain("test2");
      expect(group3.permissions).not.to.contain("test1");
      expect(group3.permissions).not.to.contain("test2");
    });

    it("should add multiple roles to all shops when specified", () => {
      const shop = Factory.create("shop");
      const shop2 = Factory.create("shop");
      const shop3 = Factory.create("shop");

      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });
      let group2 = Factory.create("group", { shopId: shop2._id, slug: "customer" });
      let group3 = Factory.create("group", { shopId: shop3._id, slug: "customer" });

      Reaction.addRolesToGroups({ allShops: true, roles: ["test1", "test2"], groups: ["customer"] });

      group = Groups.findOne({ slug: "customer", shopId: shop._id });
      group2 = Groups.findOne({ slug: "customer", shopId: shop2._id });
      group3 = Groups.findOne({ slug: "customer", shopId: shop3._id });

      expect(group.permissions).to.contain("test1");
      expect(group.permissions).to.contain("test2");
      expect(group2.permissions).to.contain("test1");
      expect(group2.permissions).to.contain("test2");
      expect(group3.permissions).to.contain("test1");
      expect(group3.permissions).to.contain("test2");
    });

    it("should update allShops when flag is true even if subset of shops are specified", () => {
      const shop = Factory.create("shop");
      const shop2 = Factory.create("shop");
      const shop3 = Factory.create("shop");

      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });
      let group2 = Factory.create("group", { shopId: shop2._id, slug: "customer" });
      let group3 = Factory.create("group", { shopId: shop3._id, slug: "customer" });

      Reaction.addRolesToGroups({ allShops: true, shops: [shop._id, shop2._id], roles: ["test1", "test2"], groups: ["customer"] });

      group = Groups.findOne({ slug: "customer", shopId: shop._id });
      group2 = Groups.findOne({ slug: "customer", shopId: shop2._id });
      group3 = Groups.findOne({ slug: "customer", shopId: shop3._id });

      expect(group.permissions).to.contain("test1");
      expect(group.permissions).to.contain("test2");
      expect(group2.permissions).to.contain("test1");
      expect(group2.permissions).to.contain("test2");
      expect(group3.permissions).to.contain("test1");
      expect(group3.permissions).to.contain("test2");
    });

    it("should add roles to multiple role sets (e.g customer and guest)", () => {
      const shop = Factory.create("shop");
      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });
      let group2 = Factory.create("group", { shopId: shop._id, slug: "guest" });

      Reaction.addRolesToGroups({ allShops: true, shops: [shop._id], roles: ["test1", "test2"], groups: ["customer", "guest"] });

      group = Groups.findOne({ slug: "customer", shopId: shop._id });
      group2 = Groups.findOne({ slug: "guest", shopId: shop._id });

      expect(group.permissions).to.contain("test1");
      expect(group.permissions).to.contain("test2");
      expect(group2.permissions).to.contain("test1");
      expect(group2.permissions).to.contain("test2");
    });

    it("should not add roles to unspecified role sets", () => {
      const shop = Factory.create("shop");
      let group = Factory.create("group", { shopId: shop._id, slug: "customer" });
      let group2 = Factory.create("group", { shopId: shop._id, slug: "guest" });

      Reaction.addRolesToGroups({ allShops: true, shops: [shop._id], roles: ["test1", "test2"], groups: ["guest"] });

      group = Groups.findOne({ slug: "customer", shopId: shop._id });
      group2 = Groups.findOne({ slug: "guest", shopId: shop._id });

      expect(group.permissions).not.to.contain("test1");
      expect(group.permissions).not.to.contain("test2");
      expect(group2.permissions).to.contain("test1");
      expect(group2.permissions).to.contain("test2");
    });

    it("should not add roles to non-extant role sets", () => {
      const shop = Factory.create("shop");

      Reaction.addRolesToGroups({ allShops: true, shops: [shop._id], roles: ["test1", "test2"], groups: ["madeupRoleSet"] });

      const group = Groups.findOne({ slug: "madeupRoleSet", shopId: shop._id });

      expect(group && group.permissions).to.equal(undefined);
    });
  });
});
