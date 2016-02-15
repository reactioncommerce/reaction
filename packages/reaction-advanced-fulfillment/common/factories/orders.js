Factory.define('orderForAF', ReactionCore.Collections.Orders,
  Factory.extend('order', {
    shopId: ReactionCore.getShopId(),
    shipping: [{address: faker.reaction.address()}],
    billing: [{address: faker.reaction.address()}]
  })
);
