/**
 * faker.reaction
 * @summary reaction specific faker methods for testing
 *
 */
faker.reaction = {};

/**
 * faker.reaction.user()
 *
 * @returns test address data
 */
/* faker.reaction.user = {
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
 * faker.reaction.address()
 *
 * @returns test address data
 */

faker.reaction.address = function () {
  return {
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
};

/**
 * faker.reaction.metaField()
 *
 * @returns test metaField data
 */

faker.reaction.metaField = function (fakerParams) {
  params = fakerParams || {};
  return {
    key: params.key ? params.key : faker.commerce.productAdjective(),
    value: params.value ? params.value : faker.commerce.productMaterial(),
    scope: params.scope ? params.scope : "detail"
  };
};

/**
 * faker.reaction.productVariant()
 *
 * @returns test productVariant data
 */

faker.reaction.productVariant = function () {
  return {
    _id: Random.id(),
    compareAtPrice: _.random(0, 1000),
    weight: _.random(0, 10),
    inventoryManagement: faker.random.boolean(),
    inventoryPolicy: faker.random.boolean(),
    lowInventoryWarningThreshold: 1,
    inventoryQuantity: _.random(0, 100),
    price: _.random(10, 1000),
    title: faker.commerce.productName(),
    optionTitle: faker.commerce.productName(),
    sku: _.random(0, 6),
    taxable: faker.random.boolean(),
    metafields: [
      faker.reaction.metaField(),
      faker.reaction.metaField({
        key: "facebook",
        scope: "socialMessages"
      }),
      faker.reaction.metaField({
        key: "twitter",
        scope: "socialMessages"
      })
    ]
  };
};

/**
 * faker.reaction.cartItem()
 *
 * @returns test cartItem data
 */

faker.reaction.cartItem = function () {
  return {
    _id: Random.id(),
    productId: Factory.get("product"),
    shopId: Factory.get("shop"),
    quantity: _.random(1, 5),
    variants: {
      _id: Random.id(),
      compareAtPrice: _.random(0, 1000),
      weight: _.random(0, 10),
      inventoryManagement: true,
      inventoryPolicy: false,
      lowInventoryWarningThreshold: 1,
      inventoryQuantity: _.random(0, 100),
      price: _.random(10, 1000),
      optionTitle: faker.commerce.productName(),
      title: faker.lorem.words(),
      sku: faker.commerce.product(),
      taxable: true,
      metafields: [{
        key: faker.commerce.productAdjective(),
        value: faker.commerce.productMaterial(),
        scope: "detail"
      }, {
        key: "facebook",
        value: faker.lorem.paragraph(),
        scope: "socialMessages"
      }, {
        key: "twitter",
        value: faker.lorem.sentence(),
        scope: "socialMessages"
      }]
    }
  };
};
