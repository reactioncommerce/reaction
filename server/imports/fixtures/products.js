import faker from "faker";
import ReactionFaker from "./reaction-faker";

export default function () {
  /**
   * Tag Factory
   * @summary define tag Factory
   */
  Factory.define("tag", Tags, {
    name: "Tag",
    slug: "tag",
    position: _.random(0, 100000),
    //  relatedTagIds: [],
    isTopLevel: true,
    shopId: ReactionFaker.shops.getShop()._id,
    createdAt: faker.date.past(),
    updatedAt: new Date()
  });

  /**
   * Product factory
   * @summary define product Factory
   */
  const base = {
    ancestors: [],
    shopId: ReactionFaker.shops.getShop()._id
  };

  const priceRange = {
      range: "1.00 - 12.99",
      min: 1.00,
      max: 12.99
  };

  let product = {
    title: faker.commerce.productName(),
    pageTitle: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    type: "simple",
    vendor: faker.company.companyName(),
    price: priceRange,
    isLowQuantity: false,
    isSoldOut: false,
    isBackorder: false,
    metafields: [],
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
    publishedAt: new Date(),
    // publishedScope: ?,
    // templateSuffix: ?,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  Factory.define("product", Products, Object.assign({}, base, product));

  Factory.define("variant", Products, { type: "variant" });
}
