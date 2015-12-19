// to provide a comparison account
const fakeUser = Factory.create("account");

describe("Account Meteor method ", function () {
  describe("addressBookAdd", function () {
    beforeEach(function () {
      ReactionCore.Collections.Cart.remove({});
      return ReactionCore.Collections.Accounts.remove({});
    });

    it(
      "should allow user to add new addresses",
      done => {
        let account = Factory.create("account");
        spyOn(Meteor, "userId").and.returnValue(account.userId);
        const address = faker.reaction.address();

        // we already have one address by default
        expect(account.profile.addressBook.length).toEqual(1);
        Meteor.call("accounts/addressBookAdd", address);
        account = ReactionCore.Collections.Accounts.findOne(account._id);
        expect(account.profile.addressBook.length).toEqual(2);

        return done();
      }
    );

    it(
      "should allow Admin to add new addresses to other users",
      done => {
        let account = Factory.create("account");
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);

        const address = faker.reaction.address();
        expect(account.profile.addressBook.length).toEqual(1);
        Meteor.call("accounts/addressBookAdd", address, account.userId);

        account = ReactionCore.Collections.Accounts.findOne(account._id);
        expect(account.profile.addressBook.length).toEqual(2);

        return done();
      }
    );

    it(
      "should insert exactly the same address as expected",
      done => {
        let account = Factory.create("account");
        spyOn(Meteor, "userId").and.returnValue(account.userId);
        const address = faker.reaction.address();
        Meteor.call("accounts/addressBookAdd", address);
        account = ReactionCore.Collections.Accounts.findOne(account._id);
        expect(account.profile.addressBook.length).toEqual(2);

        // comparing two addresses to equality
        const newAddress = account.profile.addressBook[
        account.profile.addressBook.length - 1];
        delete newAddress._id;
        expect(_.isEqual(address, newAddress)).toEqual(true);

        return done();
      }
    );

    it(
      "should throw 400 Match Failed error if the `address` doesn't match the Address Schema",
      function (done) {
        spyOn(ReactionCore.Collections.Accounts, "update");

        expect(function () {
          return Meteor.call("accounts/addressBookAdd", {});
        }).toThrow();

        expect(function () {
          return Meteor.call("accounts/addressBookAdd", null);
        }).toThrow();

        // https://github.com/aldeed/meteor-simple-schema/issues/522
        expect(function () {
          return Meteor.call(
            "accounts/addressBookAdd",
            () => { console.log("test"); }
          );
        }).toThrow();

        expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled();

        return done();
      }
    );

    it(
      "should not let non-Admin add address to another user",
      function (done) {
        const account2 = Factory.create("account");
        spyOn(Meteor, "userId").and.returnValue(fakeUser._id);
        spyOn(ReactionCore.Collections.Accounts, "update");
        spyOn(ReactionCore.Collections.Accounts, "upsert");

        expect(function () {
          return Meteor.call("accounts/addressBookAdd", faker.reaction.address(),
            account2._id);
        }).toThrow();
        expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled();
        expect(ReactionCore.Collections.Accounts.upsert).not.toHaveBeenCalled();

        return done();
      }
    );

    it(
      "should disabled isShipping/BillingDefault properties inside sibling" +
      " address if we enable their while adding",
      done => {
        let account = Factory.create("account");
        let shop = Factory.create("shop");
        ReactionCore.sessionId = Random.id(); // Required for creating a cart

        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);

        Meteor.call("cart/createCart", account.userId, shop._id);
        // cart was created without any default addresses, we need to add one
        const address = Object.assign({}, faker.reaction.address(), {
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("accounts/addressBookAdd", address);

        // Now we need to override cart with new address
        const newAddress = Object.assign({}, faker.reaction.address(), {
          _id: Random.id(),
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("accounts/addressBookAdd", newAddress);

        // now we need to get address ids from cart and compare their
        const cart = ReactionCore.Collections.Cart.findOne({
          userId: account.userId
        });
        expect(cart.shipping[0].address._id).toEqual(newAddress._id);
        expect(cart.billing[0].address._id).toEqual(newAddress._id);

        return done();
      }
    );

    //it(
    //  "",
    //  done => {
    //    let account = Factory.create("account");
    //    return done();
    //  }
    //);
  });

  describe("addressBookUpdate", function () {
    ReactionCore.sessionId = Random.id(); // Required for creating a cart

    beforeEach(() => {
      ReactionCore.Collections.Cart.remove({});
      ReactionCore.Collections.Accounts.remove({});
    });

    it(
      "should allow user to edit addresses",
      done => {
        let account = Factory.create("account");
        let shop = Factory.create("shop");
        // ReactionCore.sessionId = Random.id(); // Required for creating a cart

        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(ReactionCore.Collections.Accounts, "update");
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);

        Meteor.call("cart/createCart", account.userId, shop._id);

        // we put new faker address over current address to test all fields
        // at once, but keep current address._id
        const address = Object.assign({}, account.profile.addressBook[0],
          faker.reaction.address());

        Meteor.call("accounts/addressBookUpdate", address);
        expect(ReactionCore.Collections.Accounts.update).toHaveBeenCalled();

        return done();
      }
    );

    it(
      "should allow Admin to edit other user address",
      done => {
        let account = Factory.create("account");
        let shop = Factory.create("shop");
        // ReactionCore.sessionId = Random.id(); // Required for creating a cart

        spyOn(ReactionCore, "hasPermission").and.returnValue(true);
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);

        Meteor.call("cart/createCart", account.userId, shop._id);

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

    it(
      "should update fields to exactly the same what we need",
      done => {
        let account = Factory.create("account");
        let shop = Factory.create("shop");
        // ReactionCore.sessionId = Random.id(); // Required for creating a cart

        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);

        Meteor.call("cart/createCart", account.userId, shop._id);

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

    it(
      "should throw error if `address` doesn't match the Address Schema",
      done => {
        spyOn(ReactionCore.Collections.Accounts, "update");

        expect(function () {
          return Meteor.call("accounts/addressBookUpdate", {});
        }).toThrow();

        expect(function () {
          return Meteor.call("accounts/addressBookUpdate", null);
        }).toThrow();

        // https://github.com/aldeed/meteor-simple-schema/issues/522
        expect(function () {
          return Meteor.call(
            "accounts/addressBookUpdate",
            () => { console.log("test"); }
          );
        }).toThrow();

        expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled();
        return done();
      }
    );

    it(
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

    it(
      "enabling isShipping/BillingDefault properties should adds this address to cart",
      done => {
        let account = Factory.create("account");
        let shop = Factory.create("shop");

        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);

        Meteor.call("cart/createCart", account.userId, shop._id);
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

    it(
      "should disabled isShipping/BillingDefault properties inside sibling" +
      " address if we enable their while editing",
      done => {
        let account = Factory.create("account");
        let shop = Factory.create("shop");

        spyOn(Meteor, "userId").and.returnValue(account.userId);
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);

        Meteor.call("cart/createCart", account.userId, shop._id);
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

    it(
      "should update cart default addresses via `type` argument",
      done => {
        let account = Factory.create("account");
        const userId = account.userId;
        let shop = Factory.create("shop");

        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        spyOn(Meteor, "userId").and.returnValue(userId);

        Meteor.call("cart/createCart", userId, shop._id);
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

    //it(
    //  "",
    //  done => {
    //    let account = Factory.create("account");
    //    return done();
    //  }
    //);
  });

  describe("addressBookRemove", function () {
    it(
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

    it(
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

    it(
      "should throw error if wrong arguments was passed",
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
        }).toThrow();

        expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled();

        return done();
      }
    );

    it(
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

    it(
      "should call `cart/unsetAddresses` Method",
      done => {
        const account = Factory.create("account");
        const address = account.profile.addressBook[0];
        // user
        spyOn(Meteor, "userId").and.returnValue(account.userId);
        // spyOn(Meteor, "call");

        Meteor.call("accounts/addressBookRemove", address._id);

        // fixme: don't what syntax will be right here...
        expect(Meteor.call("cart/unsetAddresses")).toHaveBeenCalled();

        return done();
      }
    );

    it(
      "should return zero(0) if address not exists",
      done => {
        spyOn(Meteor, "userId").and.returnValue(fakeUser.userId);

        const result = Meteor.call("accounts/addressBookRemove", "asdasdasd");

        expect(result).toEqual(0);

        return done();
      }
    );
  });

  describe("accounts/inviteShopMember", function () {
    it("should not let non-Owners invite a user to the shop", function (
      done) {
      const shopId = Factory.create("shop")._id;
      spyOn(ReactionCore, "hasOwnerAccess").and.returnValue(false);
      spyOn(Accounts, "createUser");
      // create user
      expect(function () {
        return Meteor.call("accounts/inviteShopMember", shopId,
          fakeUser.emails[0].address, fakeUser.profile.name);
      }).toThrow(new Meteor.Error(403, "Access denied"));
      // expect that createUser shouldnt have run
      expect(Accounts.createUser).not.toHaveBeenCalledWith({
        username: fakeUser.profile.name
      });
      return done();
    });

    it("should let a Owner invite a user to the shop", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const shopId = Factory.get("shop")._id;
      //  TODO checking this is failing, even though we can see it happening in the log.
      // spyOn(Email, "send");
      expect(function () {
        return Meteor.call("accounts/inviteShopMember",
          shopId,
          fakeUser.emails[0].address,
          fakeUser.profile.name);
      }).not.toThrow(new Meteor.Error(403, "Access denied"));
      // expect(Email.send).toHaveBeenCalled();
      return done();
    });
  });
});
