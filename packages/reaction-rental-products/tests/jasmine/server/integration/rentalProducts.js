describe('getoutfitted:reaction-rental-products methods', function () {
  describe('rentalProducts/setProductType', function () {
    beforeEach(function () {
      Products = ReactionCore.Collections.Products;
      Products.remove({});
      InventoryVariants.remove({});
    });

    it('should throw 403 error by non admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(false);
      const product = Factory.create('product');
      spyOn(Products, 'update');

      expect(function () {
        Meteor.call('rentalProducts/setProductType', product._id, 'rental');
      }).toThrow(new Meteor.Error(403, 'Access Denied'));

      expect(Products.update).not.toHaveBeenCalled();
      done();
    });

    it('should set product type to rental by admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('product');
      expect(product.type).toEqual('simple');
      expect(_.size(product.variants)).toEqual(1);
      Meteor.call('rentalProducts/setProductType', product._id, 'rental');

      const updatedProduct = Products.findOne(product._id);
      expect(updatedProduct.type).toEqual('rental');
      done();
    });

    it('should initialize inventoryVariants', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('product');
      const productQty = product.variants[0].inventoryQuantity;
      expect(_.size(product.variants)).toEqual(1);

      Meteor.call('rentalProducts/setProductType', product._id, 'rental');
      const inventoryVariants = InventoryVariants.find({parentId: product.variants[0]._id});
      const inventoryVariant = inventoryVariants.fetch()[0];
      expect(inventoryVariants.count()).toEqual(productQty);
      expect(inventoryVariant.unavailableDates).toEqual([]);
      done();
    });

    it('should initialize pricePerDay for variants', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('product');

      expect(_.size(product.variants)).toEqual(1);
      Meteor.call('rentalProducts/setProductType', product._id, 'rental');

      const updatedProduct = Products.findOne(product._id);
      expect(updatedProduct.variants[0].pricePerDay).toEqual(product.variants[0].price);
      done();
    });

    it('should not initialize inventory variants', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('theProductFormerlyKnownAsRental');
      expect(product.type).toEqual('simple');
      expect(product.variants.length).toEqual(2);

      Meteor.call('rentalProducts/setProductType', product._id, 'rental');
      const updatedProduct = Products.findOne(product._id);
      expect(updatedProduct.type).toEqual('rental');
      expect(updatedProduct.variants[1].rentalPrice).toBeUndefined();
      done();
    });

    it('should not update previously set variant price per day', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('theProductFormerlyKnownAsRental');
      expect(product.type).toEqual('simple');
      expect(product.variants.length).toEqual(2);

      Meteor.call('rentalProducts/setProductType', product._id, 'rental');
      const updatedProduct = Products.findOne(product._id);
      expect(updatedProduct.type).toEqual('rental');
      expect(updatedProduct.variants[0].rentalPrice).toEqual(product.variants[0].rentalPrice);
      done();
    });

    it('should not update previously set variant unavailable dates', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('theProductFormerlyKnownAsRental');
      expect(product.type).toEqual('simple');
      expect(product.variants.length).toEqual(2);

      Meteor.call('rentalProducts/setProductType', product._id, 'rental');
      const updatedProduct = Products.findOne(product._id);
      expect(updatedProduct.type).toEqual('rental');
      expect(updatedProduct.variants[0].unavailableDates).toEqual(product.variants[0].unavailableDates);
      done();
    });
  });

  // TODO: depricate this in favor of rentalProducts/cloneVariant method
  xdescribe('cloneRentalVariant', function () {
    beforeEach(function () {
      Products.remove({});
    });

    it('should throw 403 error by non admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(false);
      const product = Factory.create('rentalProduct');
      spyOn(Products, 'insert');

      expect(function () {
        Meteor.call('products/cloneVariant', product._id, product.variants[0]._id);
      }).toThrow(new Meteor.Error(403, 'Access Denied'));

      expect(Products.insert).not.toHaveBeenCalled();
      done();
    });

    it('should have rental variant properties', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('rentalProduct');

      expect(_.size(product.variants)).toEqual(1);
      Meteor.call('products/cloneVariant', product._id, product.variants[0]._id);

      const updatedProduct = Products.findOne(product._id);
      expect(_.size(updatedProduct.variants)).toEqual(2);
      expect(updatedProduct.variants[0].unavailableDates).toEqual([]);
      expect(updatedProduct.variants[1].unavailableDates).toEqual([]);
      done();
    });

    it('should clone rental variant by admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('rentalProduct');

      expect(_.size(product.variants)).toEqual(1);
      Meteor.call('products/cloneVariant', product._id, product.variants[0]._id);

      const updatedProduct = Products.findOne(product._id);
      expect(_.size(updatedProduct.variants)).toEqual(2);
      done();
    });
  });

  describe('createVariant', function () {
    beforeEach(function () {
      Products.remove({});
    });

    it('should throw 403 error by non admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(false);
      const product = Factory.create('rentalProduct');

      spyOn(Products, 'update');
      expect(function () {
        Meteor.call('products/createVariant', product._id);
      }).toThrow(new Meteor.Error(403, 'Access Denied'));
      expect(Products.update).not.toHaveBeenCalled();

      done();
    });

    it('should create variant by admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('rentalProduct');
      expect(_.size(product.variants)).toEqual(1);
      Meteor.call('products/deleteVariant', product.variants[0]._id);
      Meteor.call('products/createVariant', product._id);

      const updatedProduct = Products.findOne(product._id);
      expect(_.size(updatedProduct.variants)).toEqual(1);

      const variant = updatedProduct.variants[0];
      expect(variant.type).toEqual('rentalVariant');
      expect(variant.title).toEqual('');
      expect(variant.price).toEqual(0);
      done();
    });
  });

  describe('updateVariant', function () {
    beforeEach(function () {
      Products.remove({});
    });

    it('should throw 403 error by non admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(false);
      const product = Factory.create('product');

      spyOn(Products, 'update');
      expect(function () {
        Meteor.call('products/updateVariant', product.variants[0]);
      }).toThrow(new Meteor.Error(403, 'Access Denied'));

      expect(Products.update).not.toHaveBeenCalled();
      done();
    });
  });

  describe('createProduct', function () {
    beforeEach(function () {
      Products.remove({});
    });
    // TODO: Need afterhook to create inventoryVariants
    xit('should have rental attributes', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const prodId = Meteor.call('products/createProduct');
      const product = Products.findOne(prodId);
      const variant = product.variants[0];
      expect(product.type).toEqual('rental');
      expect(variant.events[0].title).toEqual('Inbounded');
      done();
    });
  });

// TODO: Depricate this in favor of advanced fulfillment solution.
  describe('rentalProducts/createInventoryEvent', function () {
    let productEvents = {};

    beforeEach(function () {
      Products.remove({});
      InventoryVariants.remove({});

      // TODO: MOVE events to faker
      productEvents.ex1 = {
        title: 'Left Warehouse',
        description: 'Picked up by FedEx. Tracking #123456'
      };

      productEvents.ex2 = {
        title: 'Delivered',
        description: 'Delivered to Hotel',
        location: {
          address1: '564 Main Street',
          address2: 'C/O Resort Hotel Guest in Room 123',
          city: 'Telluride',
          region: 'CO',
          postal: '81435',
          metafields: {
            key: 'hotel',
            value: 'Resort Hotel'
          }
        }
      };
    });

    it('should 403 error by non permissioned user', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(false);
      const inventoryVariant = Factory.create('inventoryVariant');
      spyOn(InventoryVariants, 'update');
      expect(function () {
        Meteor.call('rentalProducts/createInventoryEvent', inventoryVariant._id, productEvents.ex1);
      }).toThrow(new Meteor.Error(403, 'Access Denied'));
      expect(InventoryVariants.update).not.toHaveBeenCalled();
      done();
    });

    it('should insert a new basic event for a given variant', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const inventoryVariant = Factory.create('inventoryVariant');
      Meteor.call('rentalProducts/createInventoryEvent', inventoryVariant._id, productEvents.ex1);

      const updatedInventory = InventoryVariants.findOne(inventoryVariant._id);
      expect(updatedInventory.events.length).toEqual(2);
      expect(updatedInventory.events[1].title).toEqual('Left Warehouse');
      done();
    });

    it('should insert a new complete event for a given variant', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const inventoryVariant = Factory.create('inventoryVariant');
      Meteor.call('rentalProducts/createInventoryEvent', inventoryVariant._id, productEvents.ex2);

      const updatedInventory = InventoryVariants.findOne(inventoryVariant._id);
      const inventoryEvent = updatedInventory.events[1];
      expect(updatedInventory.events.length).toEqual(2);
      expect(inventoryEvent.location.city).toEqual('Telluride');
      done();
    });
  });

  describe('rentalProducts/checkVariantAvailability', function () {
    beforeEach(function () {
      Products.remove({});
      InventoryVariants.remove({});
    });

    it('should return array of available inventory variant ids', function (done) {
      const product = Factory.create('rentalProduct');
      const variant = product.variants[0];
      _(variant.inventoryQuantity).times(function (n) {
        Factory.create('inventoryVariant', {
          parentId: variant._id,
          productId: product._id,
          barcode: 'BARCODE' + n,
          sku: 'BARCODE'
        });
      });
      const quantity = _.random(1, variant.inventoryQuantity);
      const inventoryVariants = InventoryVariants.find({parentId: variant._id});
      expect(inventoryVariants.count()).toEqual(variant.inventoryQuantity);

      const inventoryAvailable = Meteor.call('rentalProducts/checkInventoryAvailability', variant._id, {
        startTime: moment().startOf('day').add(3, 'days').toDate(),
        endTime: moment().startOf('day').add(5, 'days').toDate()
      }, quantity);
      expect(inventoryAvailable.length).toEqual(quantity);
      done();
    });

    it('should return array of available inventory variant ids up to the max inventory available', function (done) {
      const product = Factory.create('rentalProduct');
      const variant = product.variants[0];
      const quantity = variant.inventoryQuantity;
      const quantityRequested = 200;
      _(quantity).times(function (n) {
        Factory.create('inventoryVariant', {
          parentId: variant._id,
          productId: product._id,
          barcode: 'BARCODE' + n,
          sku: 'BARCODE',
          unavailableDates: faker.getoutfitted.takenDates
        });
      });

      const inventoryAvailable = Meteor.call('rentalProducts/checkInventoryAvailability', variant._id, {
        startTime: moment().startOf('day').add(3, 'days').toDate(),
        endTime: moment().startOf('day').add(5, 'days').toDate()
      }, quantityRequested);

      expect(inventoryAvailable.length).toEqual(quantity);
      done();
    });

    it('should be return empty array if requested dates are booked for all inventory variants', function (done) {
      const product = Factory.create('rentalProduct');
      const variant = product.variants[0];
      const quantity = variant.inventoryQuantity;
      _(quantity).times(function (n) {
        Factory.create('inventoryVariant', {
          parentId: variant._id,
          productId: product._id,
          barcode: 'BARCODE' + n,
          sku: 'BARCODE',
          unavailableDates: faker.getoutfitted.takenDates
        });
      });

      const inventoryAvailable = Meteor.call('rentalProducts/checkInventoryAvailability', variant._id, {
        startTime: moment().startOf('day').add(10, 'days').toDate(),
        endTime: moment().startOf('day').add(16, 'days').toDate()
      }, 1);

      expect(inventoryAvailable.length).toEqual(0);
      done();
    });

    it('should be return empty array if requested dates are partially booked for all inventory variants', function (done) {
      const product = Factory.create('rentalProduct');
      const variant = product.variants[0];
      const quantity = variant.inventoryQuantity;
      _(quantity).times(function (n) {
        Factory.create('inventoryVariant', {
          parentId: variant._id,
          productId: product._id,
          barcode: 'BARCODE' + n,
          sku: 'BARCODE',
          unavailableDates: faker.getoutfitted.takenDates
        });
      });

      const inventoryAvailable = Meteor.call('rentalProducts/checkInventoryAvailability', variant._id, {
        startTime: moment().startOf('day').add(4, 'days').toDate(),
        endTime: moment().startOf('day').add(10, 'days').toDate()
      }, 1);

      expect(inventoryAvailable.length).toEqual(0);
      done();
    });
  });
});
