
if (process.env.NODE_ENV === "development") {
  Fake = {};
  /**
  * Fake.reactionAddress()
  *
  * @returns test address data
  */

  Fake.reactionAddress = function() {
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
  * Fake.reactionMetaField()
  *
  * @returns test reactionMetaField data
  */

  Fake.reactionMetaField = function(params) {
    params = params || {};
    return {
      key: params.key ? params.key : faker.commerce.productAdjective(),
      value: params.value ? params.value : faker.commerce.productMaterial(),
      scope: params.scope ? params.scope : 'detail'
    };
  };

  /**
  * Fake.reactionMetaField()
  *
  * @returns variant product test data
  */
  Fake.reactionProductVariant = function() {
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
        Fake.reactionMetaField(),
        Fake.reactionMetaField({key: 'facebook', scope: 'socialMessages'}),
        Fake.reactionMetaField({key: 'twitter', scope: 'socialMessages'})
      ]
    };
  };
}
