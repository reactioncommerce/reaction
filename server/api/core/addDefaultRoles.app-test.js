import { sinon } from "meteor/practicalmeteor:sinon";
import { expect } from "meteor/practicalmeteor:chai";
import { Shops } from "/lib/collections";
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

    it("should add a role to defaultRoles in a specified shop", () => {
      let shop = Factory.create("shop");
      Reaction.addRolesToDefaultRoleSet({ shops: [shop._id], roles: ["test-role"], roleSets: ["defaultRoles"] });
      shop = Shops.findOne();
      expect(shop.defaultRoles).to.contain("test-role");
    });

    it("should add a role to defaultRoles for an array of shops", () => {
      let shop = Factory.create("shop");
      let shop2 = Factory.create("shop");
      Reaction.addRolesToDefaultRoleSet({ shops: [shop._id, shop2._id], roles: ["test-role2"], roleSets: ["defaultRoles"] });
      shop = Shops.findOne({ _id: shop._id });
      shop2 = Shops.findOne({ _id: shop2._id });
      expect(shop.defaultRoles).to.contain("test-role2");
      expect(shop2.defaultRoles).to.contain("test-role2");
    });

    it("should add a role to defaultRoles for all shops", () => {
      let shop = Factory.create("shop");
      let shop2 = Factory.create("shop");
      Reaction.addRolesToDefaultRoleSet({ allShops: true, roles: ["test-all-shops"], roleSets: ["defaultRoles"] });
      shop = Shops.findOne({ _id: shop._id });
      shop2 = Shops.findOne({ _id: shop2._id });
      expect(shop.defaultRoles).to.contain("test-all-shops");
      expect(shop2.defaultRoles).to.contain("test-all-shops");
    });

    it("should only add a role to the specified shop", () => {
      let shop = Factory.create("shop");
      let shop2 = Factory.create("shop");
      Reaction.addRolesToDefaultRoleSet({ shops: [shop._id], roles: ["test-certain-shop"], roleSets: ["defaultRoles"] });
      shop = Shops.findOne({ _id: shop._id });
      shop2 = Shops.findOne({ _id: shop2._id });
      expect(shop.defaultRoles).to.contain("test-certain-shop");
      expect(shop2.defaultRoles).not.to.contain("test-certain-shop");
    });

    it("should not add any roles if no shops are specified", () => {
      let shop = Factory.create("shop");
      let shop2 = Factory.create("shop");
      Reaction.addRolesToDefaultRoleSet({ shops: [], roles: ["test-no-shop"], roleSets: ["defaultRoles"] });
      shop = Shops.findOne({ _id: shop._id });
      shop2 = Shops.findOne({ _id: shop2._id });
      expect(shop.defaultRoles).not.to.contain("test-certain-shop");
      expect(shop2.defaultRoles).not.to.contain("test-certain-shop");
    });

    it("should add multiple roles to a shop", () => {
      let shop = Factory.create("shop");

      Reaction.addRolesToDefaultRoleSet({ shops: [shop._id], roles: ["test1", "test2"], roleSets: ["defaultRoles"] });

      shop = Shops.findOne({ _id: shop._id });

      expect(shop.defaultRoles).to.contain("test1");
      expect(shop.defaultRoles).to.contain("test2");
    });

    it("should add multiple roles to an array of specified shops", () => {
      let shop = Factory.create("shop");
      let shop2 = Factory.create("shop");
      let shop3 = Factory.create("shop");

      Reaction.addRolesToDefaultRoleSet({ shops: [shop._id, shop2._id], roles: ["test1", "test2"], roleSets: ["defaultRoles"] });

      shop = Shops.findOne({ _id: shop._id });
      shop2 = Shops.findOne({ _id: shop2._id });
      shop3 = Shops.findOne({ _id: shop3._id });

      expect(shop.defaultRoles).to.contain("test1");
      expect(shop.defaultRoles).to.contain("test2");
      expect(shop2.defaultRoles).to.contain("test1");
      expect(shop2.defaultRoles).to.contain("test2");
      expect(shop3.defaultRoles).not.to.contain("test1");
      expect(shop3.defaultRoles).not.to.contain("test2");
    });

    it("should add multiple roles to all shops when specified", () => {
      let shop = Factory.create("shop");
      let shop2 = Factory.create("shop");
      let shop3 = Factory.create("shop");

      Reaction.addRolesToDefaultRoleSet({ allShops: true, roles: ["test1", "test2"], roleSets: ["defaultRoles"] });

      shop = Shops.findOne({ _id: shop._id });
      shop2 = Shops.findOne({ _id: shop2._id });
      shop3 = Shops.findOne({ _id: shop3._id });

      expect(shop.defaultRoles).to.contain("test1");
      expect(shop.defaultRoles).to.contain("test2");
      expect(shop2.defaultRoles).to.contain("test1");
      expect(shop2.defaultRoles).to.contain("test2");
      expect(shop3.defaultRoles).to.contain("test1");
      expect(shop3.defaultRoles).to.contain("test2");
    });

    it("should update allShops when flag is true even if subset of shops are specified", () => {
      let shop = Factory.create("shop");
      let shop2 = Factory.create("shop");
      let shop3 = Factory.create("shop");

      Reaction.addRolesToDefaultRoleSet({ allShops: true, shops: [shop._id, shop2._id], roles: ["test1", "test2"], roleSets: ["defaultRoles"] });

      shop = Shops.findOne({ _id: shop._id });
      shop2 = Shops.findOne({ _id: shop2._id });
      shop3 = Shops.findOne({ _id: shop3._id });

      expect(shop.defaultRoles).to.contain("test1");
      expect(shop.defaultRoles).to.contain("test2");
      expect(shop2.defaultRoles).to.contain("test1");
      expect(shop2.defaultRoles).to.contain("test2");
      expect(shop3.defaultRoles).to.contain("test1");
      expect(shop3.defaultRoles).to.contain("test2");
    });

    it("should add roles to multiple role sets", () => {
      let shop = Factory.create("shop");

      Reaction.addRolesToDefaultRoleSet({ allShops: true, shops: [shop._id], roles: ["test1", "test2"], roleSets: ["defaultRoles", "defaultVisitorRole"] });

      shop = Shops.findOne({ _id: shop._id });

      expect(shop.defaultRoles).to.contain("test1");
      expect(shop.defaultRoles).to.contain("test2");
      expect(shop.defaultVisitorRole).to.contain("test1");
      expect(shop.defaultVisitorRole).to.contain("test2");
    });

    it("should not add roles to unspecified role sets", () => {
      let shop = Factory.create("shop");

      Reaction.addRolesToDefaultRoleSet({ allShops: true, shops: [shop._id], roles: ["test1", "test2"], roleSets: ["defaultVisitorRole"] });

      shop = Shops.findOne({ _id: shop._id });

      expect(shop.defaultRoles).not.to.contain("test1");
      expect(shop.defaultRoles).not.to.contain("test2");
      expect(shop.defaultVisitorRole).to.contain("test1");
      expect(shop.defaultVisitorRole).to.contain("test2");
    });

    it("should not add roles to non-extant role sets", () => {
      let shop = Factory.create("shop");

      Reaction.addRolesToDefaultRoleSet({ allShops: true, shops: [shop._id], roles: ["test1", "test2"], roleSets: ["madeupRoleSet"] });

      shop = Shops.findOne({ _id: shop._id });

      expect(shop.madeupRoleSet).to.equal(undefined);
    });
  });
});
