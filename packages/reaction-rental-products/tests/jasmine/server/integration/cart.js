describe('getoutfitted:reaction-rental-products cart methods', function () {
  describe('rentalProducts/setRentalPeriod', function () {
    beforeEach(function () {
      Products = ReactionCore.Collections.Products;
      Cart = ReactionCore.Collections.Cart;
      Cart.remove({});
      Products.remove({});
    });

    it('should set cart rental start and end times', function (done) {
      const cart = Factory.create('cart');
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental + rentalLength, 'days').toDate();
      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);
      const updatedCart = Cart.findOne(cart._id);
      expect(+updatedCart.startTime).toEqual(+startTime);
      expect(+updatedCart.endTime).toEqual(+endTime);
      done();
    });

    it('should set rental length in days', function (done) {
      const cart = Factory.create('cart');
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental + rentalLength, 'days').toDate();
      const lengthInDays = moment(startTime).twix(endTime).count('days');

      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);

      const updatedCart = Cart.findOne(cart._id);
      expect(updatedCart.rentalDays).toEqual(lengthInDays);
      done();
    });

    it('should set rental length in days with empty cart', function (done) {
      const cart = Factory.create('emptyCart');
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental + rentalLength, 'days').toDate();
      const lengthInDays = moment(startTime).twix(endTime).count('days');

      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);

      const updatedCart = Cart.findOne(cart._id);
      expect(updatedCart.rentalDays).toEqual(lengthInDays);
      done();
    });

    it('should set rental length in hours', function (done) {
      const cart = Factory.create('cart');
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental + rentalLength, 'days').toDate();
      const lengthInHours = moment(startTime).twix(endTime).count('hours');

      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);

      const updatedCart = Cart.findOne(cart._id);
      expect(updatedCart.rentalHours).toEqual(lengthInHours);
      done();
    });

    it('should round up to nearest unit of time', function (done) {
      const daysTilRental = _.random(7, 30);
      const cart = Factory.create('cart');
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental, 'days').endOf('day').toDate();
      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);

      const updatedCart = Cart.findOne(cart._id);
      expect(updatedCart.rentalDays).toEqual(1);
      done();
    });

    it('should update item prices in cart if cart rental length changes', function (done) {
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
      const emptyCart = Factory.create('rentalCart', {items: []});
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().startOf('day').add(daysTilRental, 'days').toDate();
      const endTime = moment().endOf('day').add(daysTilRental + rentalLength - 1, 'days').toDate();
      const lengthInDays = moment(startTime).twix(endTime).count('days');

      Meteor.call('cart/addToCart', emptyCart._id, product._id, product.variants[0], '1');
      const cart = Cart.findOne(emptyCart._id);
      expect(cart.cartSubTotal()).toEqual(Number(product.variants[0].pricePerDay * cart.rentalDays).toFixed(2));

      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', emptyCart._id, startTime, endTime);
      const updatedCart = Cart.findOne(emptyCart._id);
      expect(updatedCart.rentalDays).toEqual(lengthInDays);
      expect(updatedCart.cartSubTotal()).toEqual(Number(product.variants[0].pricePerDay * updatedCart.rentalDays).toFixed(2));
      done();
    });

    it('should only update rental item prices if cart rental length changes', function (done) {
      const rentalProduct = Factory.create('rentalProduct');
      const variant = rentalProduct.variants[0];
      const quantity = variant.inventoryQuantity;
      _(quantity).times(function (n) {
        Factory.create('inventoryVariant', {
          parentId: variant._id,
          productId: rentalProduct._id,
          barcode: 'BARCODE' + n,
          sku: 'BARCODE',
          unavailableDates: faker.getoutfitted.takenDates
        });
      });
      const product = Factory.create('product');
      const emptyCart = Factory.create('rentalCart', {items: []});
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().startOf('day').add(daysTilRental, 'days').toDate();
      const endTime = moment().endOf('day').add(daysTilRental + rentalLength - 1, 'days').toDate();
      const lengthInDays = moment(startTime).twix(endTime).count('days');

      // add simple and rental products to cart
      Meteor.call('cart/addToCart', emptyCart._id, rentalProduct._id, rentalProduct.variants[0], '1');
      Meteor.call('cart/addToCart', emptyCart._id, product._id, product.variants[0], '1');
      const cart = Cart.findOne(emptyCart._id);
      expect(cart.cartSubTotal()).toEqual(
        Number(rentalProduct.variants[0].pricePerDay * cart.rentalDays + product.variants[0].price).toFixed(2));

      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', emptyCart._id, startTime, endTime);
      const updatedCart = Cart.findOne(emptyCart._id);
      expect(updatedCart.rentalDays).toEqual(lengthInDays);
      expect(updatedCart.cartSubTotal()).toEqual(
        Number(rentalProduct.variants[0].pricePerDay * updatedCart.rentalDays + product.variants[0].price).toFixed(2));
      done();
    });

    it('should only update rental item prices if cart rental length changes', function (done) {
      const product = Factory.create('product');
      const emptyCart = Factory.create('rentalCart', {items: []});
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().startOf('day').add(daysTilRental, 'days').toDate();
      const endTime = moment().endOf('day').add(daysTilRental + rentalLength - 1, 'days').toDate();
      const lengthInDays = moment(startTime).twix(endTime).count('days');

      // Add simple product to cart
      Meteor.call('cart/addToCart', emptyCart._id, product._id, product.variants[0], '1');
      const cart = Cart.findOne(emptyCart._id);
      expect(cart.cartSubTotal()).toEqual(product.variants[0].price.toFixed(2));

      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', emptyCart._id, startTime, endTime);
      const updatedCart = Cart.findOne(emptyCart._id);
      expect(updatedCart.rentalDays).toEqual(lengthInDays);
      expect(updatedCart.cartSubTotal()).toEqual(product.variants[0].price.toFixed(2));
      done();
    });
  });

  describe('before:cart/addToCart', function () {
    beforeEach(function () {
      Cart.remove({});
      Products.remove({});
    });

    it('should have standard product price if product is "simple" type', function (done) {
      const product = Factory.create('product');
      const emptyCart = Factory.create('cart', {items: []});
      Meteor.call('cart/addToCart', emptyCart._id, product._id, product.variants[0], '1');
      const cart = Cart.findOne(emptyCart._id);
      expect(cart.items[0].variants.price).toEqual(product.variants[0].price);
      expect(cart.items[0].quantity).toEqual(1);
      expect(cart.items.length).toEqual(1);
      expect(cart.cartSubTotal()).toEqual(product.variants[0].price.toFixed(2));
      done();
    });

    it('should calculate rental price if product is "rental" type', function (done) {
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
      const emptyCart = Factory.create('rentalCart', {items: []});
      Meteor.call('cart/addToCart', emptyCart._id, product._id, product.variants[0], '1');
      const cart = Cart.findOne(emptyCart._id);
      expect(cart.items[0].variants.price).toEqual(product.variants[0].pricePerDay * cart.rentalDays);
      expect(cart.items[0].quantity).toEqual(1);
      expect(cart.items.length).toEqual(1);
      expect(cart.cartSubTotal()).toEqual(Number(product.variants[0].pricePerDay * cart.rentalDays).toFixed(2));
      done();
    });
  });
});
