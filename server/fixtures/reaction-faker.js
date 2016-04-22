import { Shops } from "/lib/collections";

/**
 * ReactionFaker
 * the naming is lowercase because of the original package name "faker".
 * there is also a "Faker", which is an older version, so we're being specific.
 * @summary reaction specific faker methods for testing
 *
 */

const ReactionFaker = {};

/**
 * ReactionFaker.shops
 * @summary reaction specific faker methods for generating test shops.
 */
ReactionFaker.shops = {
  getShop: function () {
    const existingShop = Shops.findOne();
    return existingShop || Factory.create("shop");
  },

  getShops(limit = 2) {
    const shops = [];
    const existingShops = Shops.find({}, { limit }).fetch();
    for (let i = 0; i < limit; i = i + 1) {
      let shop = existingShops[i] || Factory.create("shop");
      shops.push(shop);
    }
    return shops;
  }
};

/**
 * ReactionFaker.user()
 *
 * @returns test address data
 */
/* ReactionFaker.user = {
	user: function() {		return {
			username: faker.internet.username(),
			emails: [
				{
					address: faker.internet.email(),
					verified: true
				}
			],

			profile: {
				name: faker.name.findName()
			}
		}
	}
};*/

/**
 * ReactionFaker.address()
 *
 * @param {Object}  [options] - optional options to override generated values
 * @param {string}  [options.fullName] - Full Name of addressee
 * @param {string}  [options.address1] - Address Line 1
 * @param {string}  [options.address2] - Address Line 2
 * @param {string}  [options.city] - City
 * @param {string}  [options.companyName] - Company Name Address Line
 * @param {string}  [options.phone] - Phone Number
 * @param {string}  [options.region] - State or Region Abbreviation
 * @param {string}  [options.country] - Country code
 * @param {Boolean} [options.isCommercial] - is this a commercial address?
 * @param {Boolean} [options.isShippingDefault] - is this the default shipping address for this user?
 * @param {Boolean} [options.isBillingDefault] - is this the default billing address for this user?
 * @param {Array}   [options.metafields] - array of Metafield Objects
 *
 * @returns {Object} - test address
 */
ReactionFaker.address = function (options = {}) {
  const defaults = {
    fullName: faker.name.findName(),
    address1: faker.address.streetAddress(),
    address2: faker.address.secondaryAddress(),
    city: faker.address.city(),
    company: faker.company.companyName(),
    phone: faker.phone.phoneNumber(),
    region: faker.address.stateAbbr(),
    postal: faker.address.zipCode(),
    country: faker.address.countryCode(),
    isCommercial: faker.random.boolean(),
    isShippingDefault: faker.random.boolean(),
    isBillingDefault: faker.random.boolean(),
    metafields: []
  };
  return _.defaults(options, defaults);
};

/**
 * ReactionFaker.metaField()
 *
 * @param   {Object} [options] - options object to override generated default values
 * @param   {string} [options.key] - metaField key
 * @param   {string} [options.value] - metaField value
 * @param   {string} [options.scope] - metaField scope
 * @returns {Object} - randomly generated metaField
 */
ReactionFaker.metaField = function (options = {}) {
  const defaults = {
    key: faker.commerce.productAdjective(),
    value: faker.commerce.productMaterial(),
    scope: "detail"
  };
  return _.defaults(options, defaults);
};

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
ReactionFaker.productVariant = function (options = {}) {
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
    shopId: ReactionFaker.shops.getShop()._id,
    sku: _.random(0, 6),
    taxable: faker.random.boolean(),
    type: "variant",
    metafields: [
      ReactionFaker.metaField(),
      ReactionFaker.metaField({
        key: "facebook",
        scope: "socialMessages"
      }),
      ReactionFaker.metaField({
        key: "twitter",
        scope: "socialMessages"
      })
    ]
  };
  return _.defaults(options, defaults);
};

/**
 * ReactionFaker.cartItem()
 *
 * @param {Object} [options] - Options object (optional)
 * @param {string} [options._id] - id of CartItem
 * @param {string} [options.productId] - _id of product that item came from
 * @param {string} [options.shopId] - _id of shop that item came from
 * @param {number} [options.quantity] - quantity of item in CartItem
 * @param {Object} [options.variants] - _single_ variant object. ¯\_(ツ)_/¯ why called variants
 *
 * @returns {Object} - randomly generated cartItem/orderItem data object
 */
ReactionFaker.cartItem = function (options = {}) {
  const product = ReactionFaker.products.add();
  const variant = Products.findOne({ ancestors: [product._id] });
  const childVariants = Products.find({ ancestors: [
    product._id, variant._id
  ] }).fetch();
  const selectedOption = Random.choice(childVariants);
  const defaults = {
    _id: Random.id(),
    productId: product._id,
    shopId: ReactionFaker.shops.getShop()._id,
    quantity: _.random(1, selectedOption.inventoryQuantity),
    variants: selectedOption
  };
  return _.defaults(options, defaults);
};

/**
 * ReactionFaker.order
 * @type {Object}
 * @summary reaction specific faker functions for providing fake order data for testing
 */
ReactionFaker.order = {
  randomProcessor: function () {
    return _.sample(["Stripe", "Paypal", "Braintree"]);
  },

  randomStatus: function () {
    return _.sample([
      "created",
      "approved",
      "failed",
      "canceled",
      "expired",
      "pending",
      "voided",
      "settled"
    ]);
  },

  randomMode: function () {
    return _.sample(["authorize", "capture", "refund", "void"]);
  },

  paymentMethod: function (doc) {
    return {
      processor: doc.processor ? doc.processor : ReactionFaker.order.randomProcesssor(),
      storedCard: doc.storedCard ? doc.storedCard : "4242424242424242",
      transactionId: doc.transactionId ? doc.transactionId : Random.id(),
      status: doc.status ? doc.status : ReactionFaker.order.randomStatus(),
      mode: doc.mode ? doc.mode : ReactionFaker.order.randomMode(),
      authorization: "auth field",
      amount: doc.amount ? doc.amount : faker.commerce.price()
    };
  },

  userId: function () {
    return ReactionFaker.users.getUser()._id;
  },

  shopId: function () {
    return ReactionFaker.shops.getShop()._id;
  }
};

/**
 * ReactionFaker.users
 * @type {Object}
 * @summary reaction specific faker methods for generating test users
 */
ReactionFaker.users = {
  getUser: function () {
    const existingUser = Meteor.users.findOne();
    return existingUser || Factory.create("user");
  },

  getUsers: function (limit = 2) {
    const users = [];
    const existingUsers = Meteor.users.find({}, {limit: limit}).fetch();
    for (let i = 0; i < limit; i = i + 1) {
      let user = existingUsers[i] || Factory.create("user");
      users.push(user);
    }
    return users;
  }
};

/**
 * ReactionFaker.products
 * @type {Object}
 * @summary reaction specific faker methods for generating test products
 */
ReactionFaker.products = {
  add() {
    const product = Factory.create("product");
    // top level variant
    const variant = Factory.create("variant", Object.assign({},
      ReactionFaker.productVariant(), { ancestors: [product._id] }));
    // option one
    Factory.create("variant", Object.assign({}, ReactionFaker.productVariant(),
      { ancestors: [product._id, variant._id] }));
    // options two
    Factory.create("variant", Object.assign({}, ReactionFaker.productVariant(),
      { ancestors: [product._id, variant._id] }));

    return product;
  },
  /**
   * ReactionFaker.products.getProduct()
   * @returns {Object} first existing reaction product found or Factory created product
   */
  getProduct: function () {
    const existingProduct = Products.findOne();
    return existingProduct || Factory.create("product");
  },

  /**
   * ReactionFaker.products.getProducts()
   * @param {int} [limit=2] - number of products to generate. Default 2
   * @returns {Object[]} Array of product objects found or generated with a Factory.
   */
  getProducts: function (limit = 2) {
    const products = [];
    const existingProducts = Products.find({}, {limit: limit}).fetch();
    for (let i = 0; i < limit; i = i + 1) {
      let product = existingProducts[i] || Factory.create("product");
      products.push(product);
    }
    return products;
  }
};

export default ReactionFaker;
