Fake.reactionMetaField = function(params) {
  params = params || {};
  return {
    key: params.key ? params.key : Fake.word(),
    value: params.value ? params.value : Fake.sentence(),
    scope: params.scope ? params.scope : 'detail'
  };
};

Fake.reactionProductVariant = function() {
  return {
    _id: Random.id(),
    compareAtPrice: _.random(0, 1000),
    weight: _.random(0, 10),
    inventoryManagement: true,
    inventoryPolicy: false,
    lowInventoryWarningThreshold: 1,
    inventoryQuantity: _.random(0, 100),
    price: _.random(10, 1000),
    optionTitle: Fake.word(),
    title: Fake.word(),
    sku: _.random(0, 6),
    taxable: true,
    metafields: [
      Fake.reactionMetaField(),
      Fake.reactionMetaField({key: 'facebook', scope: 'socialMessages'}),
      Fake.reactionMetaField({key: 'twitter', scope: 'socialMessages'})
    ]
  };
};

Factory.define('product', ReactionCore.Collections.Products, {
  shopId: Factory.get('shop'),
  title: Fake.word,
  pageTitle: Fake.sentence(5),
  description: Fake.paragraph(20),
  productType: Fake.sentence(2),
  vendor: '',
  metafields: [],
  variants: [
    Fake.reactionProductVariant()
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
  isVisible: false,
  publishedAt: new Date(),
  // publishedScope: ?,
  // templateSuffix: ?,
  createdAt: new Date(),
  updatedAt: new Date()
});

Factory.define('tag', ReactionCore.Collections.Tags, {
  name: Fake.word,
  slug: Fake.word,
  position: _.random(0, 100000),
  //  relatedTagIds: [],
  isTopLevel: true,
  shopId: Factory.get('shop'),
  createdAt: new Date(),
  updatedAt: new Date()
});
