/**
* variantList helpers
*/
Template.variantList.helpers({
  variants: function() {
    var inventoryTotal, product, variant, variants, _i, _j, _len, _len1, _ref;
    product = selectedProduct();
    if (product) {
      variants = (function() {
        var _i, _len, _ref, _results;
        _ref = product.variants;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          variant = _ref[_i];
          if (variant.parentId == null) {
            _results.push(variant);
          }
        }
        return _results;
      })();
      inventoryTotal = 0;
      for (_i = 0, _len = variants.length; _i < _len; _i++) {
        variant = variants[_i];
        if (!isNaN(variant.inventoryQuantity)) {
          inventoryTotal += variant.inventoryQuantity;
        }
      }
      for (_j = 0, _len1 = variants.length; _j < _len1; _j++) {
        variant = variants[_j];
        this.variant;
        variant.inventoryTotal = inventoryTotal;
        variant.inventoryPercentage = parseInt((variant.inventoryQuantity / inventoryTotal) * 100);
        variant.inventoryWidth = parseInt(variant.inventoryPercentage - ((_ref = variant.title) != null ? _ref.length : void 0));
      }
      return variants;
    }
  },
  childVariants: function() {
    var current, product, variant, variants;
    product = selectedProduct();
    if (product) {
      current = selectedVariant();
      if (current != null ? current._id : void 0) {
        if (current.parentId != null) {
          variants = (function() {
            var _i, _len, _ref, _results;
            _ref = product.variants;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              variant = _ref[_i];
              if (variant.parentId === current.parentId && variant.optionTitle && variant.type !== 'inventory') {
                _results.push(variant);
              }
            }
            return _results;
          })();
        } else {
          variants = (function() {
            var _i, _len, _ref, _results;
            _ref = product.variants;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              variant = _ref[_i];
              if (variant.parentId === current._id && variant.optionTitle && variant.type !== 'inventory') {
                _results.push(variant);
              }
            }
            return _results;
          })();
        }
        return variants;
      }
    }
  }
});

/**
* variantList events
*/

Template.variantList.events({
  "click #create-variant": function(event) {
    return Meteor.call("createVariant", this._id);
  },
  "click .variant-select-option": function(event, template) {
    template.$(".variant-select-option").removeClass("active");
    $(event.target).addClass("active");
    Alerts.removeSeen();
    return setCurrentVariant(this._id);
  }
});
;
