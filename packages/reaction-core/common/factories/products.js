/**
 * tag Factory
 *
 */

Factory.define("tag", ReactionCore.Collections.Tags, {
  name: "Tag",
  slug: "tag",
  position: _.random(0, 100000),
  //  relatedTagIds: [],
  isTopLevel: true,
  shopId: Factory.get("shop"),
  createdAt: faker.date.past(),
  updatedAt: new Date()
});

/**
 * product Factory
 */

Factory.define("product", ReactionCore.Collections.Products, {
  shopId: Factory.get("shop"),
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
