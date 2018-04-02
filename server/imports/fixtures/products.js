import faker from "faker";
import _ from "lodash";
import { Factory } from "meteor/dburles:factory";
import { Products, Tags } from "/lib/collections";
import { getShop } from "./shops";
import { Hooks } from "/server/api";


/**
 * ReactionFaker.metaField()
 *
 * @param   {Object} [options] - options object to override generated default values
 * @param   {string} [options.key] - metaField key
 * @param   {string} [options.value] - metaField value
 * @param   {string} [options.scope] - metaField scope
 * @returns {Object} - randomly generated metaField
 */
export function metaField(options = {}) {
  const defaults = {
    key: faker.commerce.productAdjective(),
    value: faker.commerce.productMaterial(),
    scope: "detail"
  };
  return _.defaults(options, defaults);
}

/**
 * ReactionFaker.productVariant()
 *
 * @param {Object} [options] - Options object
 * @param {string} [options._id] - id
 * @param {string} [options.parentId] - variant's parent's ID. Sets variant as child.
 * @param {string} [options.compareAtPrice] - MSRP Price / Compare At Price
 * @param {string} [options.weight] - productVariant weight
 * @param {string} [options.inventoryManagement] - Track inventory for this product?
 * @param {string} [options.inventoryPolicy] - Allow overselling of this product?
 * @param {string} [options.lowInventoryWarningThreshold] - Qty left of inventory that sets off warning
 * @param {string} [options.inventoryQuantity] - Inventory Quantity
 * @param {string} [options.price] - productVariant price
 * @param {string} [options.title] - productVariant title
 * @param {string} [options.optionTitle] - productVariant option title
 * @param {string} [options.sku] - productVariant sku
 * @param {string} [options.taxable] - is this productVariant taxable?
 * @param {Object[]} [options.metafields] - productVariant metaFields
 *
 * @returns {Object} - randomly generated productVariant
 */
export function productVariant(options = {}) {
  const defaults = {
    ancestors: [],
    compareAtPrice: _.random(0, 1000),
    weight: _.random(0, 10),
    inventoryManagement: faker.random.boolean(),
    inventoryPolicy: faker.random.boolean(),
    lowInventoryWarningThreshold: _.random(1, 5),
    inventoryQuantity: _.random(0, 100),
    price: _.random(10, 1000),
    title: faker.commerce.productName(),
    optionTitle: faker.commerce.productName(),
    shopId: getShop()._id,
    sku: _.random(0, 6),
    taxable: faker.random.boolean(),
    type: "variant",
    metafields: [
      metaField(),
      metaField({
        key: "facebook",
        scope: "socialMessages"
      }),
      metaField({
        key: "twitter",
        scope: "socialMessages"
      })
    ]
  };
  return _.defaults(options, defaults);
}

export function addProduct(options = {}) {
  const product = Factory.create("product", options);
  Hooks.Events.run("afterInsertCatalogProductInsertRevision", product);
  // top level variant
  const variant = Factory.create("variant", Object.assign({}, productVariant(options), { ancestors: [product._id] }));
  Hooks.Events.run("afterInsertCatalogProductInsertRevision", variant);
  const variant2 = Factory.create("variant", Object.assign({}, productVariant(options), { ancestors: [product._id, variant._id] }));
  Hooks.Events.run("afterInsertCatalogProductInsertRevision", variant2);
  const variant3 = Factory.create("variant", Object.assign({}, productVariant(options), { ancestors: [product._id, variant._id] }));
  Hooks.Events.run("afterInsertCatalogProductInsertRevision", variant3);
  return product;
}

export function addProductSingleVariant() {
  const product = Factory.create("product");
  Hooks.Events.run("afterInsertCatalogProductInsertRevision", product);
  // top level variant
  const variant = Factory.create("variant", Object.assign({}, productVariant(), { ancestors: [product._id] }));
  Hooks.Events.run("afterInsertCatalogProductInsertRevision", variant);
  return { product, variant };
}

export function getProduct() {
  const existingProduct = Products.findOne();
  return existingProduct || Factory.create("product");
}


export function getProducts(limit = 2) {
  const products = [];
  const existingProducts = Products.find({}, { limit }).fetch();
  for (let i = 0; i < limit; i += 1) {
    const product = existingProducts[i] || Factory.create("product");
    products.push(product);
  }
  return products;
}


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
    shopId: getShop()._id,
    createdAt: faker.date.past(),
    updatedAt: new Date()
  });

  /**
   * Product factory
   * @summary define product Factory
   */
  const base = {
    ancestors: [],
    shopId: getShop()._id
  };

  const priceRange = {
    range: "1.00 - 12.99",
    min: 1.00,
    max: 12.99
  };

  const product = {
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
    isVisible: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  Factory.define("product", Products, Object.assign({}, base, product));
  Factory.define("variant", Products, {
    type: "variant"
  });
}
