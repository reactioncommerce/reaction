import faker from "faker";
import ReactionFaker from "./reaction-faker";

/**
 * Factory account
 */

export default function () {
  Factory.define("account", Accounts, {
    shopId: Factory.get("shop"),
    userId: ReactionFaker.order.userId(),
    emails: [{
      address: faker.internet.email(),
      verified: faker.random.boolean()
    }],
    acceptsMarketing: true,
    state: "new",
    note: faker.lorem.sentences(),
    profile: {
      addressBook: [
        ReactionFaker.address()
      ]
    },
    metafields: [],
    createdAt: new Date,
    updatedAt: new Date()
  });
}
