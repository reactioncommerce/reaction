import faker from "faker";
import _ from "lodash";
import { Factory } from "meteor/dburles:factory";
import { Products, Tags } from "/lib/collections";
import getSlug from "../Reaction/getSlug";
import { getShop } from "./shops";

/**
 * @method metaField
 * @memberof Fixtures
 * @param   {Object} [options] - options object to override generated default values
 * @param   {String} [options.key] - metaField key
 * @param   {String} [options.value] - metaField value
 * @param   {String} [options.scope] - metaField scope
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
 * @method productVariant
 * @memberof Fixtures
 * @param {Object} [options] - Options object
 * @param {String} [options._id] - id
 * @param {String} [options.parentId] - variant's parent's ID. Sets variant as child.
 * @param {String} [options.compareAtPrice] - MSRP Price / Compare At Price
 * @param {String} [options.weight] - productVariant weight
 * @param {String} [options.inventoryManagement] - Track inventory for this product?
 * @param {String} [options.inventoryPolicy] - Allow overselling of this product?
 * @param {String} [options.lowInventoryWarningThreshold] - Qty left of inventory that sets off warning
 * @param {String} [options.inventoryQuantity] - Inventory Quantity
 * @param {String} [options.price] - productVariant price
 * @param {String} [options.title] - productVariant title
 * @param {String} [options.optionTitle] - productVariant option title
 * @param {String} [options.sku] - productVariant sku
 * @param {String} [options.taxable] - is this productVariant taxable?
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
    isVisible: true,
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

/**
 * @method addProduct
 * @summary Create a product with variants
 * @memberof Fixtures
 * @param {Object} [options={}] [description]
 * @param {String} [options._id] - id
 * @param {String} [options.parentId] - variant's parent's ID. Sets variant as child.
 * @param {String} [options.compareAtPrice] - MSRP Price / Compare At Price
 * @param {String} [options.weight] - productVariant weight
 * @param {String} [options.inventoryManagement] - Track inventory for this product?
 * @param {String} [options.inventoryPolicy] - Allow overselling of this product?
 * @param {String} [options.lowInventoryWarningThreshold] - Qty left of inventory that sets off warning
 * @param {String} [options.inventoryQuantity] - Inventory Quantity
 * @param {String} [options.price] - productVariant price
 * @param {String} [options.title] - productVariant title
 * @param {String} [options.optionTitle] - productVariant option title
 * @param {String} [options.sku] - productVariant sku
 * @param {String} [options.taxable] - is this productVariant taxable?
 * @param {Object[]} [options.metafields] - productVariant metaFields
 * @returns {Object} Product
 */
export function addProduct(options = {}) {
  const product = Factory.create("product", options);
  // top level variant
  const variant = Factory.create("variant", Object.assign({}, productVariant(options), { ancestors: [product._id] }));
  Factory.create("variant", Object.assign({}, productVariant(options), { ancestors: [product._id, variant._id] }));
  Factory.create("variant", Object.assign({}, productVariant(options), { ancestors: [product._id, variant._id] }));
  return product;
}

/**
 * @method addProductSingleVariant
 * @summary Create a product with 1 variant
 * @memberof Fixtures
 * @param {Object} [options={}] Product variant options object
 * @returns {Object} Product with Variant
 */
export function addProductSingleVariant() {
  const product = Factory.create("product");
  // top level variant
  const variant = Factory.create("variant", Object.assign({}, productVariant(), { ancestors: [product._id] }));
  return { product, variant };
}

/**
 * @method getProduct
 * @summary Get a product
 * @memberof Fixtures
 * @param {Object} [options={}] Product variant options object
 * @returns {Object} Product
 */
export function getProduct() {
  const existingProduct = Products.findOne();
  return existingProduct || Factory.create("product");
}

/**
 * @method getProducts
 * @summary Get a number of products
 * @memberof Fixtures
 * @param {Object} [limit=2] Number of products
 * @returns {Array} Array of products
 */
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
   * @name tag
   * @memberof Fixtures
   * @example Factory.create("tag")
   * @summary Define a Tag for Products
   * @property {String} name - `"Tag"`
   * @property {String} slug - `"tag"`
   * @property {Number} position - `_.random(0, 100000)`
   * @property {Boolean} isTopLevel - `true`
   * @property {String} shopId - `getShop()._id`
   * @property {Date} createdAt - `faker.date.past()`
   * @property {Date} updatedAt - `new Date()`
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
   * @name Product
   * @memberof Fixtures
   * @example const product = Factory.create("product")
   * @example Factory.create("variant", Object.assign({}, productVariant(options), { ancestors: [product._id, variant._id] }));
   * @summary Define a factory for Product
   * @property {Array} ancestors `[]`
   * @property {String} shopId `getShop()._id`
   * @property {String} title `faker.commerce.productName()`
   * @property {String} pageTitle `faker.lorem.sentence()`
   * @property {String} description `faker.lorem.paragraph()`
   * @property {String} type `"simple"` or `"variant"` for Product Variant
   * @property {String} vendor `faker.company.companyName()`
   * @property {Object} price `priceRange`
   * @property {String} price.range `"1.00 - 12.99"`
   * @property {Number} price.min `1.00`
   * @property {Number} price.max `12.9`
   * @property {Boolean} isLowQuantity `false`
   * @property {Boolean} isSoldOut `false`
   * @property {Boolean} isBackorder `false`
   * @property {Array} metafields `[]`
   * @property {Boolean} requiresShipping `true`
   * @property {Array} hashtags `[]`
   * @property {Boolean} isVisible `true`
   * @property {Date} publishedAt `new Date()`
   * @property {Date} createdAt `new Date()`
   * @property {Date} updatedAt `new Date()`
   */
  const base = {
    ancestors: [],
    shopId: () => getShop()._id
  };

  const priceRange = {
    range: "1.00 - 12.99",
    min: 1.00,
    max: 12.99
  };

  const productTitle = faker.commerce.productName();

  const product = {
    title: productTitle,
    pageTitle: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    handle: getSlug(productTitle),
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
