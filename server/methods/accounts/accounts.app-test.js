/* eslint dot-notation: 0 */

import { Meteor } from "meteor/meteor";
import { Accounts, Packages, Orders, Products, Shops, Cart }  from "/lib/collections";
import { Reaction } from "/server/api";
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { expect, assert } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import _ from  "underscore";
import { getShop, getAddress } from "/server/imports/fixtures/shops";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe.skip("Account Meteor method ", function () {
  const shopId = getShop()._id;
  const fakeUser = Factory.create("account");
  let originals = {};
  let sandbox;

  before(function () {
    originals["mergeCart"] = Meteor.server.method_handlers["cart/mergeCart"];
    originals["setShipmentAddress"] = Meteor.server.method_handlers["cart/setShipmentAddress"];
    originals["setPaymentAddress"] = Meteor.server.method_handlers["cart/setPaymentAddress"];
  });

  after(() => {
    Packages.remove({});
    Cart.remove({});
    Accounts.remove({});
    Orders.remove({});
    Products.remove({});
    Shops.remove({});
    // resetDatabase();
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("addressBookAdd", function () {
    beforeEach(function () {
      Cart.remove({});
      Accounts.remove({});
    });

    function spyOnMethod(method, id) {
      return sandbox.stub(Meteor.server.method_handlers, `cart/${method}`, function () {
        check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
        this.userId = id;
        return originals[method].apply(this, arguments);
      });
    }


    it.skip("should allow user to add new addresses", function (done) {
      let account = Factory.create("account");
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(account.userId);
      const address = getAddress();

      // we already have one address by default
      expect(account.profile.addressBook.length).to.equal(1);
      Meteor.call("accounts/addressBookAdd", address);
      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(2);
      return done();
    });

    it.skip("should allow Admin to add new addresses to other users", function(done) {
      let account = Factory.create("account");
      sandbox.stub(Reaction, "hasPermission", function () {
        return true;
      });

      const address = getAddress();
      expect(account.profile.addressBook.length).to.equal(1);
      Meteor.call("accounts/addressBookAdd", address, account.userId);

      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(2);
      return done();
    });

    it.skip("should insert exactly the same address as expected", function (done) {
      let account = Factory.create("account");
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(account.userId);
      const address = getAddress();
      Meteor.call("accounts/addressBookAdd", address);
      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(2);

      // comparing two addresses to equality
      const newAddress = account.profile.addressBook[
      account.profile.addressBook.length - 1];
      delete newAddress._id;
      expect(_.isEqual(address, newAddress)).to.be.true;
      return done();
    });

    it.skip("should throw error if wrong arguments were passed", function (done) {
      let accountSpy = sandbox.spy(Accounts, "update");

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", 123456);
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", {});
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", null);
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookAdd");
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", "asdad", 123);
      }).to.throw;

      // https://github.com/aldeed/meteor-simple-schema/issues/522
      expect(function () {
        return Meteor.call(
          "accounts/addressBookAdd",
          () => { console.log("test"); }
        );
      }).to.not.throw;

      expect(accountSpy).to.not.have.been.called;

        return done();
    });

    it.skip("should not let non-Admin add address to another user", function (done) {
      const account2 = Factory.create("account");
      sandbox.stub(Meteor, "userId", function () {
        return fakeUser._id;
      });
      // spyOn(Meteor, "userId").and.returnValue(fakeUser._id);
      let updateAccountSpy = sandbox.spy(Accounts, "update");
      // spyOn(ReactionCore.Collections.Accounts, "update");
      let upsertAccountSpy = sandbox.spy(Accounts, "upsert");
      // spyOn(ReactionCore.Collections.Accounts, "upsert");

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", getAddress(),
          account2._id);
      }).to.throw();
      expect(updateAccountSpy).to.not.have.been.called;
      expect(upsertAccountSpy).to.not.have.been.called;

      return done();
    });

    it.skip("should disabled isShipping/BillingDefault properties inside sibling" +
      " address if we enable their while adding",
      function (done) {
        let account = Factory.create("account");
        const sessionId = Random.id(); // Required for creating a cart
        spyOnMethod("setShipmentAddress", account.userId);
        spyOnMethod("setPaymentAddress", account.userId);
        sandbox.stub(Meteor, "userId", function () {
          return account.userId;
        });
        sandbox.stub(Reaction, "getShopId", function () {
          return shopId;
        });
        // spyOn(ReactionCore, "getShopId").and.returnValue(shopId);

        Meteor.call("cart/createCart", account.userId, sessionId);
        // cart was created without any default addresses, we need to add one
        const address = Object.assign({}, getAddress(), {
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("accounts/addressBookAdd", address);

        // Now we need to override cart with new address
        const newAddress = Object.assign({}, getAddress(), {
          _id: Random.id(),
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("accounts/addressBookAdd", newAddress);

        // now we need to get address ids from cart and compare their
        const cart = Cart.findOne({userId: account.userId});
        expect(cart.shipping[0].address._id).to.equal(newAddress._id);
        expect(cart.billing[0].address._id).to.equal(newAddress._id);

        return done();
      });

    /* it.skip(
     "",
     done => {
     let account = Factory.create("account");
     return done();
     }
     ); */
  });

  describe.skip("addressBookUpdate", function () {
    // Required for creating a cart
    const sessionId = Random.id();

    beforeEach(() => {
      Cart.remove({});
      Accounts.remove({});
    });

    it.skip("should allow user to edit addresses", function (done) {
      let account = Factory.create("account");
      spyOnMethod("setShipmentAddress", account.userId);
      spyOnMethod("setPaymentAddress", account.userId);
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(account.userId);
      let updateAccountSpy = sinon.spy(Accounts, "update");
      // spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shopId);
      sandbox.stub(Reaction, "getShopId", function () {
        return shopId;
      });
      // spyOn(ReactionCore, "getShopId").and.returnValue(shopId);

      Meteor.call("cart/createCart", account.userId, sessionId);

      // we put new faker address over current address to test all fields
      // at once, but keep current address._id
      const address = Object.assign({}, account.profile.addressBook[0],
        getAddress());

      Meteor.call("accounts/addressBookUpdate", address);
      expect(updateAccountSpy).to.have.been.called;

      return done();
    });

    it.skip("should allow Admin to edit other user address", function (done) {
      let account = Factory.create("account");
      sinon.spy("setShipmentAddress", account.userId);
      sinon.spy("setPaymentAddress", account.userId);
      // spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      // spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shopId);
      spyOn(ReactionCore, "getShopId").and.returnValue(shopId);

      Meteor.call("cart/createCart", account.userId, sessionId);

      // we put new faker address over current address to test all fields
      // at once, but keep current address._id
      const address = Object.assign({}, account.profile.addressBook[0],
        faker.reaction.address());
      Meteor.call("accounts/addressBookUpdate", address, account.userId);

      // comparing two addresses to equality
      account = ReactionCore.Collections.Accounts.findOne(account._id);
      const newAddress = account.profile.addressBook[0];
      expect(_.isEqual(address, newAddress)).toEqual(true);

      return done();
      }
    );

    it.skip(
      "should update fields to exactly the same what we need",
      done => {
        let account = Factory.create("account");
        spyOnMethod("setShipmentAddress", account.userId);
        spyOnMethod("setPaymentAddress", account.userId);
        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shopId);
        spyOn(ReactionCore, "getShopId").and.returnValue(shopId);

        Meteor.call("cart/createCart", account.userId, sessionId);

        // we put new faker address over current address to test all fields
        // at once, but keep current address._id
        const address = Object.assign({}, account.profile.addressBook[0],
          faker.reaction.address());
        Meteor.call("accounts/addressBookUpdate", address);

        // comparing two addresses to equality
        account = ReactionCore.Collections.Accounts.findOne(account._id);
        const newAddress = account.profile.addressBook[0];
        expect(_.isEqual(address, newAddress)).toEqual(true);

        return done();
      }
    );

    it.skip(
      "should throw error if wrong arguments were passed",
      done => {
        spyOn(ReactionCore.Collections.Accounts, "update");

        expect(function () {
          return Meteor.call("accounts/addressBookUpdate", 123456);
        }).toThrow();

        expect(function () {
          return Meteor.call("accounts/addressBookUpdate", {});
        }).toThrow();

        expect(function () {
          return Meteor.call("accounts/addressBookUpdate", null);
        }).toThrow();

        expect(function () {
          return Meteor.call("accounts/addressBookUpdate");
        }).toThrow();

        expect(function () {
          return Meteor.call("accounts/addressBookUpdate", "asdad", 123);
        }).toThrow();

        // https://github.com/aldeed/meteor-simple-schema/issues/522
        expect(function () {
          return Meteor.call(
            "accounts/addressBookUpdate",
            () => { console.log("test"); }
          );
        }).not.toThrow();

        expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled();
        return done();
      }
    );

    it.skip(
      "should not let non-Admin to edit address of another user",
      done => {
        let account = Factory.create("account");
        const account2 = Factory.create("account");
        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(ReactionCore.Collections.Accounts, "update");

        expect(function () {
          return Meteor.call("accounts/addressBookUpdate",
            faker.reaction.address(), account2._id);
        }).toThrow();

        expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled();

        return done();
      }
    );

    it.skip(
      "enabling isShipping/BillingDefault properties should adds this address to cart",
      done => {
        let account = Factory.create("account");
        spyOnMethod("setShipmentAddress", account.userId);
        spyOnMethod("setPaymentAddress", account.userId);
        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shopId);
        spyOn(ReactionCore, "getShopId").and.returnValue(shopId);

        Meteor.call("cart/createCart", account.userId, sessionId);
        // first we need to disable defaults, because we already have some
        // random defaults in account, but cart is clean. This is test only
        // situation.
        let address = Object.assign({}, account.profile.addressBook[0], {
          isShippingDefault: false,
          isBillingDefault: false
        });
        Meteor.call("accounts/addressBookUpdate", address);
        let cart = ReactionCore.Collections.Cart.findOne({
          userId: account.userId
        });
        expect(cart.billing).toBeUndefined();
        expect(cart.shipping).toBeUndefined();

        address = Object.assign({}, account.profile.addressBook[0], {
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("accounts/addressBookUpdate", address);
        cart = ReactionCore.Collections.Cart.findOne({
          userId: account.userId
        });

        expect(cart.billing[0].address._id).toEqual(address._id);
        expect(cart.shipping[0].address._id).toEqual(address._id);

        return done();
      }
    );

    it.skip(
      "should disabled isShipping/BillingDefault properties inside sibling" +
      " address if we enable their while editing",
      done => {
        let account = Factory.create("account");
        spyOnMethod("setShipmentAddress", account.userId);
        spyOnMethod("setPaymentAddress", account.userId);
        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shopId);
        spyOn(ReactionCore, "getShopId").and.returnValue(shopId);

        Meteor.call("cart/createCart", account.userId, sessionId);
        // cart was created without any default addresses, we need to add one
        let address = Object.assign({}, account.profile.addressBook[0], {
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("accounts/addressBookUpdate", address);

        // we add new address with disabled defaults
        address = Object.assign({}, faker.reaction.address(), {
          _id: Random.id(),
          isShippingDefault: false,
          isBillingDefault: false
        });
        Meteor.call("accounts/addressBookAdd", address);
        // now we can test edit
        Object.assign(address, {
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("accounts/addressBookUpdate", address);
        account = ReactionCore.Collections.Accounts.findOne(account._id);

        expect(account.profile.addressBook[0].isBillingDefault).toBe(false);
        expect(account.profile.addressBook[0].isShippingDefault).toBe(false);

        return done();
      }
    );

    it.skip(
      "should update cart default addresses via `type` argument",
      done => {
        let account = Factory.create("account");
        const userId = account.userId;
        spyOnMethod("setShipmentAddress", account.userId);
        spyOnMethod("setPaymentAddress", account.userId);
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shopId);
        spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
        spyOn(Meteor, "userId").and.returnValue(userId);

        Meteor.call("cart/createCart", userId, sessionId);
        // clean account
        Meteor.call("accounts/addressBookRemove",
          account.profile.addressBook[0]._id);
        // preparation
        let address = Object.assign({}, faker.reaction.address(), {
          _id: Random.id(),
          isShippingDefault: false,
          isBillingDefault: false
        });
        Meteor.call("accounts/addressBookAdd", address);
        address = Object.assign(address, {
          isShippingDefault: true,
          isBillingDefault: true
        });

        Meteor.call("accounts/addressBookUpdate", address, null,
          "isBillingDefault");
        Meteor.call("accounts/addressBookUpdate", address, null,
          "isShippingDefault");

        let cart = ReactionCore.Collections.Cart.findOne({
          userId: userId
        });

        expect(cart.billing[0].address._id).toEqual(address._id);
        expect(cart.shipping[0].address._id).toEqual(address._id);

        return done();
      }
    );
  });

  describe.skip("addressBookRemove", function () {
    it.skip(
      "should allow user to remove address",
      done => {
        let account = Factory.create("account");
        const address = account.profile.addressBook[0];
        // user
        spyOn(Meteor, "userId").and.returnValue(account.userId);

        expect(account.profile.addressBook.length).toEqual(1);
        Meteor.call("accounts/addressBookRemove", address._id);
        account = ReactionCore.Collections.Accounts.findOne(account._id);
        expect(account.profile.addressBook.length).toEqual(0);

        return done();
      }
    );

    it.skip(
      "should allow Admin to remove other user address",
      done => {
        let account = Factory.create("account");
        const address = account.profile.addressBook[0];
        // admin
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);

        expect(account.profile.addressBook.length).toEqual(1);
        Meteor.call("accounts/addressBookRemove", address._id, account.userId);
        account = ReactionCore.Collections.Accounts.findOne(account._id);
        expect(account.profile.addressBook.length).toEqual(0);

        return done();
      }
    );

    it.skip(
      "should throw error if wrong arguments were passed",
      done => {
        spyOn(ReactionCore.Collections.Accounts, "update");

        expect(function () {
          return Meteor.call("accounts/addressBookRemove", 123456);
        }).toThrow();

        expect(function () {
          return Meteor.call("accounts/addressBookRemove", {});
        }).toThrow();

        expect(function () {
          return Meteor.call("accounts/addressBookRemove", null);
        }).toThrow();

        expect(function () {
          return Meteor.call("accounts/addressBookRemove");
        }).toThrow();

        expect(function () {
          return Meteor.call("accounts/addressBookRemove", "asdad", 123);
        }).toThrow();

        // https://github.com/aldeed/meteor-simple-schema/issues/522
        expect(function () {
          return Meteor.call(
            "accounts/addressBookRemove",
            () => { console.log("test"); }
          );
        }).not.toThrow();

        expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled();

        return done();
      }
    );

    it.skip(
      "should not let non-Admin to remove address of another user",
      done => {
        const account = Factory.create("account");
        const account2 = Factory.create("account");
        const address2 = account2.profile.addressBook[0];
        // user
        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(ReactionCore.Collections.Accounts, "update");

        expect(function () {
          return Meteor.call("accounts/addressBookRemove",
            address2._id, account2.userId);
        }).toThrow();

        expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled();

        return done();
      }
    );

    it.skip(
      "should call `cart/unsetAddresses` Method",
      done => {
        const account = Factory.create("account");
        const address = account.profile.addressBook[0];
        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(Meteor, "call").and.callThrough();

        Meteor.call("accounts/addressBookRemove", address._id);

        expect(Meteor.call.calls.argsFor(0)).toEqual([
          "accounts/addressBookRemove",
          address._id
        ]);
        expect(Meteor.call.calls.argsFor(1)).toEqual([
          "cart/unsetAddresses",
          address._id,
          account.userId
        ]);

        return done();
      }
    );

    it.skip(
      "should return zero(0) if address not exists",
      done => {
        spyOn(Meteor, "userId").and.returnValue(fakeUser.userId);

        const result = Meteor.call("accounts/addressBookRemove", "asdasdasd");

        expect(result).toEqual(0);

        return done();
      }
    );
  });

  describe.skip("accounts/inviteShopMember", function () {
    it.skip(
      "should not let non-Owners invite a user to the shop", function (
        done) {
        // spyOn(ReactionCore, "hasOwnerAccess").and.returnValue(false);
        spyOn(ReactionCore, "hasPermission").and.returnValue(false);
        spyOn(Accounts, "createUser");
        // create user
        expect(function () {
          return Meteor.call("accounts/inviteShopMember", shopId,
            fakeUser.emails[0].address,
            fakeUser.profile.addressBook[0].fullName);
        }).toThrow(new Meteor.Error(403, "Access denied"));
        // expect that createUser shouldnt have run
        expect(Accounts.createUser).not.toHaveBeenCalledWith({
          username: fakeUser.profile.addressBook[0].fullName
        });
        return done();
      }
    );

    it.skip(
      "should let a Owner invite a user to the shop",
      function (done) {
        // spyOn(Roles, "userIsInRole").and.returnValue(true);
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);
        // TODO checking this is failing, even though we can see it happening in the log.
        // spyOn(Email, "send");
        expect(function () {
          return Meteor.call("accounts/inviteShopMember",
            shopId,
            fakeUser.emails[0].address,
            fakeUser.profile.addressBook[0].fullName);
        }).not.toThrow(new Meteor.Error(403, "Access denied"));
        // expect(Email.send).toHaveBeenCalled();
        return done();
      }
    );
  });
});

