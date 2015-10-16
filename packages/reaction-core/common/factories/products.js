/**
 * Tag Factory
 * @summary define tag Factory
 */
Factory.define("tag", ReactionCore.Collections.Tags, {
  name: "Tag",
  slug: "tag",
  position: _.random(0, 100000),
  //  relatedTagIds: [],
  isTopLevel: true,
  shopId: faker.reaction.shops.getShop()._id,
  createdAt: faker.date.past(),
  updatedAt: new Date()
});

/**
 * Product factory
 * @summary define product Factory
 */
Factory.define("product", ReactionCore.Collections.Products, {
  shopId: faker.reaction.shops.getShop()._id,
  title: faker.commerce.productName(),
  pageTitle: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  productType: "simple",
  vendor: faker.company.companyName(),
  metafields: [],
  variants: [
    faker.reaction.productVariant()
  ],
  requiresShipping: true,
  // parcel: ?,
  hashtags: [],
  // twitterMsg: ?,
  // facebookMsg: ?,
  // googleplusMsg: ?,
  // pinterestMsg: ?,
  // metaDescription: ?,
  // handle: ?,
  isVisible: faker.random.boolean(),
  publishedAt: new Date,
  // publishedScope: ?,
  // templateSuffix: ?,
  createdAt: new Date,
  updatedAt: new Date()
});
