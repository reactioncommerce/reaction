/**
 * Factory account
 *
 */

Factory.define("account", ReactionCore.Collections.Accounts, {
  shopId: Factory.get("shop"),
  userId: faker.reaction.order.userId(),
  emails: [{
    address: faker.internet.email(),
    verified: faker.random.boolean()
  }],
  acceptsMarketing: true,
  state: "new",
  note: faker.lorem.sentences(),
  profile: {
    addressBook: [
      faker.reaction.address()
    ]
  },
  metafields: [],
  createdAt: new Date,
  updatedAt: new Date()
});
