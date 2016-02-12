function uniqueFieldValues(allProducts, field) {
  let uniq = _.uniq(_.pluck(allProducts, field));
  return _.without(uniq, undefined);
}
Template.updateOrderItem.helpers({
  item: function () {
    let itemId = Router.current().params.itemId;
    let order = this;
    let regItem = _.findWhere(order.items, {_id: itemId});
    let afItem = _.findWhere(order.advancedFulfillment.items, {_id: itemId});
    return {
      regItem: regItem,
      afItem: afItem
    };
  }
});

Template.productSelector.onRendered(function () {
  let orderId = this.data._id;
  Session.set('productType-' + orderId, undefined);
  Session.set('productColor-' + orderId, undefined);
  Session.set('productGender-' + orderId, undefined);
  Session.set('productTitle-' + orderId, undefined);
  Session.set('productVariant-' + orderId, undefined);
});

Template.productSelector.helpers({
  addItem: function () {
    let orderId = Router.current().params.orderId;
    let itemId = Router.current().params.itemId;
    if (orderId && itemId) {
      return false;
    }
    return true;
  },
  productTypes: function () {
    let allProducts = Products.find({}, {field: {productType: 1}}).fetch();
    return uniqueFieldValues(allProducts, 'productType');
  },
  productTypeSelected: function () {
    let session = Session.get('productType-' + this._id);
    if (session) {
      return true;
    }
    return false;
  },
  productGenders: function () {
    let productType = Session.get('productType-' + this._id);
    let allProducts = Products.find({productType: productType}, {field: {gender: 1}}).fetch();
    return uniqueFieldValues(allProducts, 'gender');
  },
  productGenderSelected: function () {
    let typeSession = Session.get('productType-' + this._id);
    let genderSession = Session.get('productGender-' + this._id);
    if (typeSession && genderSession) {
      return true;
    }
    return false;
  },
  productTitles: function () {
    let productType = Session.get('productType-' + this._id);
    let gender = Session.get('productGender-' + this._id);
    let allProducts = Products.find({
      productType: productType,
      gender: gender
    }, {
      field: {
        title: 1,
        vendor: 1
      },
      sort: {
        vendor: 1
      }
    }).fetch();
    return uniqueFieldValues(allProducts, 'title');
  },
  productTitleSelected: function () {
    let typeSession = Session.get('productType-' + this._id);
    let genderSession = Session.get('productGender-' + this._id);
    let title = Session.get('productTitle-' + this._id);
    if (typeSession && genderSession && title) {
      return true;
    }
    return false;
  },
  productColorWays: function () {
    let productType = Session.get('productType-' + this._id);
    let gender = Session.get('productGender-' + this._id);
    let title = Session.get('productTitle-' + this._id);
    let product = Products.findOne({
      productType: productType,
      gender: gender,
      title: title
    });
    return product.colors;
  },
  productColorSelected: function () {
    let type = Session.get('productType-' + this._id);
    let gender = Session.get('productGender-' + this._id);
    let title = Session.get('productTitle-' + this._id);
    let color = Session.get('productColor-' + this._id);
    if (type && gender && title && color) {
      return true;
    }
    return false;
  },
  productSizes: function () {
    let productType = Session.get('productType-' + this._id);
    let gender = Session.get('productGender-' + this._id);
    let title = Session.get('productTitle-' + this._id);
    let color = Session.get('productColor-' + this._id);
    let product = Products.findOne({
      productType: productType,
      gender: gender,
      title: title
    });
    let correctColoredVariants = _.filter(product.variants, function (variant) {
      return variant.color === color;
    });
    return correctColoredVariants;
  },
  productVariantSelected: function () {
    let type = Session.get('productType-' + this._id);
    let gender = Session.get('productGender-' + this._id);
    let title = Session.get('productTitle-' + this._id);
    let color = Session.get('productColor-' + this._id);
    let variant = Session.get('productVariant-' + this._id);
    if (type && gender && title && color && variant) {
      return true;
    }
    return false;
  }
});

Template.productSelector.events({
  'change .productType-selector': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let productType = event.target.value;
    Session.set('productColor-' + orderId, undefined);
    Session.set('productGender-' + this._id, undefined);
    Session.set('productTitle-' + orderId, undefined);
    Session.set('productVariant-' + orderId, undefined);
    Session.set('productType-' + orderId, productType);
  },
  'change .gender-selector': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let gender = event.target.value;
    Session.set('productColor-' + orderId, undefined);
    Session.set('productTitle-' + orderId, undefined);
    Session.set('productVariant-' + orderId, undefined);
    Session.set('productGender-' + orderId, gender);
  },
  'change .product-selector': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let title = event.target.value;
    Session.set('productColor-' + orderId, undefined);
    Session.set('productVariant-' + orderId, undefined);
    Session.set('productTitle-' + orderId, title);
  },
  'change .color-selector': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let color = event.target.value;
    Session.set('productVariant-' + orderId, undefined);
    Session.set('productColor-' + orderId, color);
  },
  'change .size-selector': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let variantId = event.target.value;
    Session.set('productVariant-' + orderId, variantId);
  },
  'click .replace-item': function (event) {
    event.preventDefault();
    let order = this;
    let user = Meteor.user();
    let oldItemId = Router.current().params.itemId;
    let type = Session.get('productType-' + this._id);
    let gender = Session.get('productGender-' + this._id);
    let title = Session.get('productTitle-' + this._id);
    let color = Session.get('productColor-' + this._id);
    let variantId = Session.get('productVariant-' + this._id);

    Meteor.call('advancedFulfillment/itemExchange', order, oldItemId, type, gender, title, color, variantId, user);
    Session.set('productColor-' + this._id, undefined);
    Session.set('productGender-' + this._id, undefined);
    Session.set('productTitle-' + this._id, undefined);
    Session.set('productVariant-' + this._id, undefined);
    Session.set('productType-' + this._id, undefined);
    Router.go('updateOrder', {_id: order._id});
  },
  'click .add-item': function (event) {
    event.preventDefault();
    let order = this;
    let user = Meteor.user();
    let type = Session.get('productType-' + this._id);
    let gender = Session.get('productGender-' + this._id);
    let title = Session.get('productTitle-' + this._id);
    let color = Session.get('productColor-' + this._id);
    let variantId = Session.get('productVariant-' + this._id);
    Meteor.call('advancedFulfillment/addItem', order, type, gender, title, color, variantId, user);
    Session.set('productColor-' + this._id, undefined);
    Session.set('productGender-' + this._id, undefined);
    Session.set('productTitle-' + this._id, undefined);
    Session.set('productVariant-' + this._id, undefined);
    Session.set('productType-' + this._id, undefined);
    Session.set('addItems', undefined);
  }
});
