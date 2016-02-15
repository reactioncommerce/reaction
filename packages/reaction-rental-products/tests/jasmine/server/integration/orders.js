describe('getoutfitted:reaction-rental-products orders methods', function () {
  describe('rentalProducts/inventoryAdjust', function () {
    beforeEach(function () {
      Products = ReactionCore.Collections.Products;
      Products.remove({});
      Orders.remove({});
    });

    it('should reserve dates requested', function (done) {
      const product = Factory.create('rentalProduct');
      const variant = product.variants[0];
      const quantity = variant.inventoryQuantity;
      _(quantity).times(function (n) {
        Factory.create('inventoryVariant', {
          parentId: variant._id,
          productId: product._id,
          barcode: 'BARCODE' + n,
          sku: 'BARCODE'
        });
      });

      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const quantityRequested = 1;
      const order = Factory.create('rentalOrder', {
        startTime: moment().startOf('day').add(daysTilRental, 'days').toDate(),
        endTime: moment().startOf('day').add(daysTilRental + rentalLength, 'days').toDate(),
        items: [
          {
            _id: faker.random.uuid(),
            productId: product._id,
            variants: variant,
            quantity: quantityRequested,
            type: 'rental'
          }
        ]
      });
      // TODO: Figure out why this is returning more than the requested number of inventoryVariants
      const preInventoryAvailable = Meteor.call('rentalProducts/checkInventoryAvailability', variant._id, {
        startTime: moment().startOf('day').add(daysTilRental, 'days').toDate(),
        endTime: moment().startOf('day').add(daysTilRental + rentalLength, 'days').toDate()
      }, quantityRequested);

      Meteor.call('rentalProducts/inventoryAdjust', order._id);
      const updatedInventoryVariant = InventoryVariants.findOne(preInventoryAvailable[0]);
      // Rental Length + 1 because we add rentalLength days to the first day.
      expect(updatedInventoryVariant.unavailableDates.length).toEqual(rentalLength + 1);
      done();
    });

    it('should insert dates into correct position', function (done) {
      done();
    });
  });
});
