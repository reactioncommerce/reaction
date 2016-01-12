let user;
describe("Subscriptions", () => {
  beforeAll(done => {
    user = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    signUp(user, () => {
      done();
    });
  });

  describe("Cart", () => {
    it(
      "cart cursor should return only one cart",
      done => {
        const carts = ReactionCore.Collections.Cart.find().count();
        expect(carts).toBe(1);

        return done();
      }
    );

    it(
      "user should have a `subscriptionId`",
      done => {
        const prevUser = Meteor.userId();
        expect(prevUser).not.toBeNull();
        const subscriptionId1 = ReactionCore.Subscriptions.Cart.subscriptionId;
        expect(subscriptionId1).toBeDefined();

        return done();
      }
    );

    it(
      "should change `subscriptionId` after logout",
      done => {
        const prevSubId = ReactionCore.Subscriptions.Cart.subscriptionId;
        const prevUser = Meteor.userId();

        Meteor.logout(() => {
          // setTimeout needed here because of subscription does not have time
          // to upgrade
          Meteor.setTimeout(() => {
            // we expect to see anonymous here, but it not to much time to
            // create anonymous, so we will see null.
            // expect(Meteor.userId()).not.toBeNull();
            expect(Meteor.userId()).not.toEqual(prevUser);

            expect(ReactionCore.Subscriptions.Cart.subscriptionId).toBeDefined();
            expect(ReactionCore.Subscriptions.Cart.subscriptionId)
              .not.toEqual(prevSubId);

            done();
          }, 50);
        });
      }
    );

    it(
      "should change `subscriptionId` when user login",
      done => {
        const prevSubId = ReactionCore.Subscriptions.Cart.subscriptionId;
        const prevUser = Meteor.userId();

        Meteor.loginWithPassword(user.email, user.password, error => {
          expect(error).toBeUndefined();
          expect(Meteor.userId()).not.toBeNull();
          expect(Meteor.userId()).not.toEqual(prevUser);
          expect(ReactionCore.Subscriptions.Cart.subscriptionId).toBeDefined();
          expect(ReactionCore.Subscriptions.Cart.subscriptionId)
            .not.toEqual(prevSubId);

          done();
        });
      }
    );

    it(
      "should not have access to previous user's cart",
      done => {
        const prevUser = Meteor.userId();
        const carts = ReactionCore.Collections.Cart.find().fetch();
        expect(carts.length).toBe(1);
        const firstCart = carts[0];

        Meteor.logout(() => {
          Meteor.setTimeout(() => {
            expect(Meteor.userId()).not.toEqual(prevUser);
            const carts2 = ReactionCore.Collections.Cart.find().fetch();
            expect(carts2.length).toBe(1);
            expect(carts2[0]._id).not.toEqual(firstCart._id);

            done();
          }, 4000);
        });
      }
    );

    it(
      "should be reassigned after localStorage reset",
      done => {
        const subscriptionId1 = ReactionCore.Subscriptions.Cart.subscriptionId;
        expect(subscriptionId1).toBeDefined();
        window.localStorage.clear();
        let subscriptionId2;

        Meteor.setTimeout(() => {
          subscriptionId2 = ReactionCore.Subscriptions.Cart.subscriptionId;
          expect(subscriptionId1).toBeDefined();
          expect(subscriptionId2)
            .not.toEqual(subscriptionId1);
          done();
        }, 3000);
      }
    );
  });
});
