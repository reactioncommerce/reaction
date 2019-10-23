import Random from "@reactioncommerce/random";

export const Accounts = {
  _hashLoginToken: jest.fn().mockName("Accounts._hashLoginToken"),
  _tokenExpiration: jest.fn().mockName("Accounts._tokenExpiration"),
  createUser: async (userInfo) => {
    const { email, name, shopId, username } = userInfo;

    const user = {
      _id: Random.id(),
      createdAt: new Date(),
      emails: [
        {
          address: email,
          verified: true,
          provides: "default"
        }
      ],
      name,
      services: {
        password: {
          bcrypt: Random.id(29)
        },
        resume: {
          loginTokens: []
        }
      },
      shopId,
      username
    };

    // await this.reactionNodeApp.collections.users.insertOne(user);

    // await this.reactionNodeApp.collections.Accounts.insertOne({ ...user, userId: user._id });

    return user._id;
  }
};
