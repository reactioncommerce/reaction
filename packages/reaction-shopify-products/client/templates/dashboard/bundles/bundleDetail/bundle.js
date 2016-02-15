Template.dashboardBundleDetail.onCreated(function () {
  this.subscribe('ShopifyProducts/Bundle', Router.current().params._id);
});

Template.dashboardBundleDetail.helpers({
  bundle: function () {
    let bundle = ReactionCore.Collections.Bundles.findOne();
    return bundle;
  },
  colors: function () {
    let bundle = ReactionCore.Collections.Bundles.findOne();
    return Object.keys(bundle.colorWays);
  }
});

Template.dashboardBundleSettings.inheritsHelpersFrom('dashboardBundleDetail');

Template.dashboardBundleSettings.onCreated(function () {
  this.subscribe('ProductsOfType', 'Jacket');
  this.subscribe('ProductsOfType', 'Midlayer');
  this.subscribe('ProductsOfType', 'Pants');
  this.subscribe('ProductsOfType', 'Goggles');
  this.subscribe('ProductsOfType', 'Gloves');
});

Template.dashboardBundleSettings.helpers({
  // TODO: Bundles should have gender
  productSelected: function (productType) {
    let bundle = ReactionCore.Collections.Bundles.findOne();
    return bundle.colorWays[this][productType + 'Id'];
  },
  hasMidlayer: function () {
    let bundle = ReactionCore.Collections.Bundles.findOne();
    return bundle.hasMidlayer;
  },
  jackets: function () {
    return Products.find({productType: 'Jacket'});
  },
  midlayers: function () {
    return Products.find({productType: 'Midlayer'});
  },
  pants: function () {
    return Products.find({productType: 'Pants'});
  },
  gloves: function () {
    return Products.find({productType: 'Gloves'});
  },
  goggles: function () {
    return Products.find({productType: 'Goggles'});
  },
  stdGoggles: function () {
    return Products.find({productType: 'Goggles'});
  },
  otgGoggles: function () {
    return Products.find({productType: 'Goggles'});
  }
});

Template.dashboardBundleSettings.events({
  'change .updateBundleProduct': function (event) {
    let options = {};
    options.bundleColor = this.toString();
    let Bundles = ReactionCore.Collections.Bundles;
    options.bundleId = Bundles.findOne()._id;
    options.productId = event.target.value;
    options.productType = event.currentTarget.name;
    Meteor.call('bundleProducts/updateBundleProduct', options);
  }
});

Template.bundleProductOption.helpers({
  isSelectedProduct: function (type, typeId) {
    const productType = this.product;
    const parentContext = Template.parentData(2);
    const bundle = ReactionCore.Collections.Bundles.findOne();

    if (bundle.colorWays[parentContext][productType + 'Id'] === typeId) {
      return 'selected';
    }
    return '';
  }
});

Template.bundleProductColorSelect.onRendered(function () {
  let instance = this;
  instance.autorun(function () {
    let bundle = ReactionCore.Collections.Bundles.findOne();
    let color = instance.data.color;
    let productType = instance.data.product[0].toLowerCase() + instance.data.product.substr(1);

    instance.data.productType = productType;
    instance.subscribe('Product', bundle.colorWays[color][productType + 'Id'] || '');
    instance.data.productId = bundle.colorWays[color][productType + 'Id'];
  });
});

Template.bundleProductColorSelect.helpers({
  colors: function () {
    let product = ReactionCore.Collections.Products.findOne(this.productId);
    if (product) {
      return product.colors;
    }
  }
});

Template.bundleProductColorSelect.events({
  'change .updateBundleColor': function () {
    let options = {};
    options.bundleColor = this.color.toString();
    options.bundleId = ReactionCore.Collections.Bundles.findOne()._id;
    options.productColor = event.target.value;
    options.productType = this.productType;
    Meteor.call('bundleProducts/updateBundleProduct', options);
  }
});

Template.bundleProductColorOption.helpers({
  isSelectedColor: function (type, typeColor) {
    let bundle = ReactionCore.Collections.Bundles.findOne();
    let productType = type[0].toLowerCase() + type.substr(1);
    if (bundle.colorWays[Template.parentData(2)][productType + 'Color'] === typeColor) {
      return 'selected';
    }
    return '';
  }
});
