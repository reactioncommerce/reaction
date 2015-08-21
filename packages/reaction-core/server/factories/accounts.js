Factory.define('account', ReactionCore.Collections.Accounts, {
  shopId: Factory.get('shop'),
  emails: [
    {
      address: Fake.word() + '@example.com',
      verified: Fake.fromArray([true, false])
    }
  ],
  acceptsMarketing: true,
  state: 'new',
  note: Fake.sentence(20),
  profile: {
    addressBook: [
      Fake.reactionAddress()
    ]
  },
  metafields: [],
  createdAt: new Date(),
  updatedAt: new Date()
});
