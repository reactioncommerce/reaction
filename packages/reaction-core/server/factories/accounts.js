/**
* Factory account
*
*/

Factory.define('account', ReactionCore.Collections.Accounts, {
  shopId: Factory.get('shop'),
  userId: Factory.get('user'),
  emails: [
    {
      address: faker.internet.email(),
      verified: faker.random.boolean()
    }
  ],
  acceptsMarketing: true,
  state: 'new',
  note: faker.lorem.sentences(),
  profile: {
    addressBook: [
      Fake.reactionAddress()
    ]
  },
  metafields: [],
  createdAt: new Date(),
  updatedAt: new Date()
});
