Template.productDetail.helpers({
  isProductType: function (productType) {
    let product = selectedProduct();
    if (product) {
      if (product.type === productType) {
        return 'true';
      }
    }
    return null;
  },
  actualRentalOrPurchasablePrice: function () {
    let childVariants;
    let purchasableOrRentable;
    let current = selectedVariant();
    let product = selectedProduct();
    let priceType = product.type === 'rental' ? 'pricePerDay' : 'price';
    if (product && current) {
      childVariants = (function () {
        let _results = [];
        for (let variant of product.variants) {
          if ((variant !== null ? variant.parentId : void 0) === current._id) {
            _results.push(variant);
          }
        }
        return _results;
      })();
      purchasableOrRentable = childVariants.length > 0 ? false : true;
    }
    if (purchasableOrRentable) {
      return current[priceType];
    }
    return getProductPriceOrPricePerDayRange();
  }
});

Template.productDetail.events({
  'change #productTypeSelect': function (event) {
    let product = selectedProduct();
    let productType = event.currentTarget.value;
    Meteor.call('rentalProducts/setProductType', product._id, productType);
  }
});
