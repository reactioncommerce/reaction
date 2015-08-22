/**
* productList helpers
*/

var Media;
Media = ReactionCore.Collections.Media;
Template.productList.helpers({
  products: function() {
    return getProductsByTag(this.tag);
  },
  media: function(variant) {
    var defaultImage, variantId, variants;
    variants = (function() {
      var _i, _len, _ref, _results;
      _ref = this.variants;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variant = _ref[_i];
        if (!variant.parentId) {
          _results.push(variant);
        }
      }
      return _results;
    }).call(this);
    if (variants.length > 0) {
      variantId = variants[0]._id;
      defaultImage = Media.findOne({
        'metadata.variantId': variantId,
        "metadata.priority": 0
      });
    }
    if (defaultImage) {
      return defaultImage;
    } else {
      return false;
    }
  }
});
