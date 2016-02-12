let sharedId = Random.id();

faker.getoutfitted = {};

faker.getoutfitted.takenDates = [
  moment().startOf('day').add(10, 'days').toDate(),
  moment().startOf('day').add(11, 'days').toDate(),
  moment().startOf('day').add(12, 'days').toDate(),
  moment().startOf('day').add(13, 'days').toDate(),
  moment().startOf('day').add(14, 'days').toDate(),
  moment().startOf('day').add(15, 'days').toDate(),
  moment().startOf('day').add(16, 'days').toDate()
];

let rentalLength = _.random(1, 12);
let timeTilRental = _.random(1, 60);

function randomVariant(options = {}) {
  defaults = {
    _id: Random.id(),
    parentId: '',
    type: 'variant',
    active: true,
    status: 'En Route',
    currentLocation: {
      coords: {
        x: 38.846127,
        y: -104.800644
      },
      city: 'Colorado Springs',
      region: 'CO',
      country: 'USA'
    },
    compareAtPrice: faker.random.number(1000),
    weight: faker.random.number(10),
    inventoryManagement: true,
    inventoryPolicy: false,
    lowInventoryWarningThreshold: 1,
    inventoryQuantity: faker.random.number(100),
    price: _.random(10, 1000),
    pricePerDay: _.random(10, 1000),
    optionTitle: faker.hacker.adjective(),
    title: faker.hacker.noun(),
    sku: faker.random.number(6),
    taxable: true,
    metafields: [
      {
        key: faker.hacker.noun(),
        value: faker.commerce.productMaterial(),
        scope: 'detail'
      }, {
        key: 'facebook',
        value: faker.hacker.phrase(),
        scope: 'socialMessages'
      }, {
        key: 'twitter',
        value: faker.hacker.phrase(),
        scope: 'socialMessages'
      }
    ]
  };

  return _.defaults(options, defaults);
}

Factory.define('rentalProduct', ReactionCore.Collections.Products, Factory.extend('product', {
  type: 'rental',
  shopId: ReactionCore.getShopId(),
  cleaningBuffer: 1,
  variants: function () {
    return [
      randomVariant()
    ];
  }
}));

Factory.define('inventoryVariant', ReactionCore.Collections.InventoryVariants, {
  id: Random.id(),
  productId: undefined,
  parentId: Random.id(),
  shopId: Random.id(),
  barcode: 'SKU123-1',
  sku: 'SKU123',
  unavailableDates: [],
  events: [
    {
      _id: Random.id(),
      createdAt: new Date,
      location: {
        coords: {
          x: 38.846127,
          y: -104.800644
        }
      },
      description: faker.hacker.phrase(),
      title: faker.commerce.productName()
    }
  ]
});

Factory.define('theProductFormerlyKnownAsRental', ReactionCore.Collections.Products, Factory.extend('product', {
  type: 'simple',
  cleaningBuffer: 1,
  variants: function () {
    return [
      randomVariant({_id: sharedId}),
      randomVariant({type: 'inventory', parentId: sharedId, unavailableDates: faker.getoutfitted.takenDates})
    ];
  }
}));

Factory.define('rentalCart', ReactionCore.Collections.Cart, Factory.extend('cart', {
  startTime: moment(new Date()).add(timeTilRental, 'days').toDate(),
  endTime: moment(new Date()).add(timeTilRental + rentalLength, 'days').toDate(),
  rentalDays: rentalLength
}));

Factory.define('emptyCart', ReactionCore.Collections.Cart, Factory.extend('cart', {
  items: undefined
}));

Factory.define('rentalOrder', ReactionCore.Collections.Orders, Factory.extend('order', {
  startTime: moment(new Date()).add(timeTilRental, 'days').toDate(),
  endTime: moment(new Date()).add(timeTilRental + rentalLength, 'days').toDate()
}));
