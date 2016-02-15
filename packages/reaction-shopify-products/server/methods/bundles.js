Meteor.methods({
  'bundleProducts/updateBundleProduct': function (options) {
    check(options, Object);
    check(options.bundleId, String);
    check(options.bundleColor, String);
    check(options.productType, String);
    check(options.productId, Match.Optional(String));
    check(options.productColor, Match.Optional(String));

    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let productTypeSelector = '';
    if (options.productId) {
      productTypeSelector = options.productType + 'Id';
    } else if (options.productColor) {
      productTypeSelector = options.productType + 'Color';
    }
    if (options.productId) {
      // Can remove setting the _id after autoValue is fixed.
      return ReactionCore.Collections.Bundles.update({
        _id: options.bundleId
      }, {
        $set: {
          _id: options.bundleId,
          ['colorWays.' + options.bundleColor + '.' + productTypeSelector]: options.productId
        }
      });
    }
    if (options.productColor) {
      return ReactionCore.Collections.Bundles.update({
        _id: options.bundleId
      }, {
        $set: {
          _id: options.bundleId,
          ['colorWays.' + options.bundleColor + '.' + productTypeSelector]: options.productColor
        }
      });
    }
    // Shouldn't get here
    throw new Meteor.Error('Tried Updateding bundle without product Id or Color');
  }
});

