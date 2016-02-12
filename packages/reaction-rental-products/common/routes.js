RentalProductsController = ShopController.extend({
  onBeforeAction: function () {
    let rentalProducts = ReactionCore.Collections.Packages.findOne({
      name: 'rental-products'
    });
    if (!rentalProducts.enabled) {
      this.render('notFound');
    } else {
      this.next();
    }
  }
});

RentalProductsAdminController = ShopAdminController.extend({
  onBeforeAction: function () {
    let rentalProducts = ReactionCore.Collections.Packages.findOne({
      name: 'rental-products'
    });
    if (!rentalProducts.enabled) {
      this.render('notFound');
    } else {
      this.next();
    }
  }
});

Router.route('datepicker', {
  path: 'datepicker',
  template: 'rentalProductsDatepicker',
  controller: RentalProductsController
});

Router.route('dashboard/rentalShopSettings', {
  name: 'dashboard.rentalShopSettings',
  controller: ShopAdminController,
  path: '/dashboard/rentalShopSettings',
  template: 'rentalShopSettings',
  waitOn: function () {
    return ReactionCore.Collections.Shops;
  }
});

Router.route('dashboard/rentalProducts', {
  name: 'dashboard.rentalProducts',
  controller: RentalProductsAdminController,
  template: 'dashboardRentalProducts',
  waitOn: function () {
    return this.subscribe('Products');
  },
  data: function () {
    if (this.params.type) {
      return {
        rentalProducts: ReactionCore.Collections.Products.find({type: this.params.type})
      };
    }
    return {
      rentalProducts: ReactionCore.Collections.Products.find({type: 'rental'})
    };
  }
});

Router.route('dashboard/rentalProducts/availability/:_id', {
  name: 'dashboard.rentalProducts.availability',
  controller: RentalProductsAdminController,
  template: 'dashboardRentalProductAvailability',
  waitOn: function () {
    return this.subscribe('Product', this.params._id);
  },
  data: function () {
    return ReactionCore.Collections.Products.findOne(this.params._id);
  }
});
