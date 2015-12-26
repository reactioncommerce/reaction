/**
 *
 */

describe("Subscriptions", () => {
  // const shop = Factory.create("shop");
  // const sessionId = ReactionCore.sessionId = Random.id();
  // const user = Factory.create("user");
  // const cart = Factory.create("cart");


  describe("Cart", () => {
    beforeEach(() => {

    });

    //afterEach(function () {
    //  //if (sub) {
    //  //  sub.stop();
    //  //  sub = undefined;
    //  //}
    //});

    it(
      "cart cursor should return only one cart",
      done => {
        const carts = ReactionCore.Collections.Cart.find().count();
        expect(carts).toBe(1);

        return done();
      }
    );

    //it(
    //  "should subscribe to cart publication",
    //  () => {
    //    // spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
    //    // spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
    //    // spyOn(Meteor, "userId").and.returnValue(user._id);
    //    // Accounts.loginWithAnonymous();
    //    expect(Meteor.userId()).not.toBeNull();
    //    expect(ReactionCore.Subscriptions.Cart.subscriptionId).toBeDefined();
    //  }
    //);

    it(
      "should change `subscriptionId` when user has changed",
      done => {
        const prevUser = Meteor.userId();
        expect(Meteor.userId()).not.toBeNull();
        const subscriptionId1 = ReactionCore.Subscriptions.Cart.subscriptionId;
        console.log(ReactionCore.Subscriptions.Cart.subscriptionId);
        expect(subscriptionId1).toBeDefined();
        console.log("prevUser " + prevUser);
        let user = {
          email: faker.internet.email(),
          password: faker.internet.password()
        };
        signUp(user);
        expect(Meteor.userId()).toBeDefined();
        console.log("User " + Meteor.userId());
        expect(Meteor.userId()).not.toEqual(prevUser);
        console.log(ReactionCore.Subscriptions.Cart.subscriptionId);

        expect(ReactionCore.Subscriptions.Cart.subscriptionId).toBeDefined();
        expect(ReactionCore.Subscriptions.Cart.subscriptionId)
          .not.toEqual(subscriptionId1);
        //console.log(ReactionCore.Subscriptions.Cart.subscriptionId);

        //Meteor.logout(() => {
        //  console.log(ReactionCore.Subscriptions.Cart.subscriptionId);
        //});

        //spyOn(Meteor, "userId").and.returnValue(user2._id);
        //Accounts.loginWithAnonymous();



        return done();
      }
    );

    //it(
    //  "should",
    //  done => {
    //    return done();
    //  }
    //);
  });
});
