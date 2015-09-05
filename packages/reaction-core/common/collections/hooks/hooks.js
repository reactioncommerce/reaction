/**
* ReactionCore Collection Hooks
* transform collections based on events
*
* See: https://github.com/matb33/meteor-collection-hooks
*/

var applyVariantDefaults, organizedChildVariants;

/**
 * applyVariantDefaults
 *
 * helper function to set defaults for Hooks
 * is how the actual defaults for variants are set
 */
applyVariantDefaults = function(variant) {
  return _.defaults(variant, {
    _id: Random.id(),
    inventoryManagement: true,
    inventoryPolicy: true,
    updatedAt: new Date,
    createdAt: new Date()
  });
};

/**
 * organizedChildVariants
 *
 * @param product
 * @returns child variant hierarchy
 */
organizedChildVariants = function(product) {
  var children, currentVariant, i, inventoryChildren, variantChildren, variantCount;
  children = {};
  inventoryChildren = {};
  variantChildren = {};
  variantCount = product.variants.length;
  currentVariant = product.variants[0];
  i = 0;
  while (i < product.variants.length) {
    currentVariant = product.variants[i];
    if (currentVariant.parentId) {
      if (!children[currentVariant.parentId]) {
        children[currentVariant.parentId] = [];
      }
      children[currentVariant.parentId].push(currentVariant);
      if (currentVariant.type === 'inventory') {
        if (!inventoryChildren[currentVariant.parentId]) {
          inventoryChildren[currentVariant.parentId] = [];
        }
        inventoryChildren[currentVariant.parentId].push(currentVariant);
      } else {
        if (!variantChildren[currentVariant.parentId]) {
          variantChildren[currentVariant.parentId] = [];
        }
        variantChildren[currentVariant.parentId].push(currentVariant);
      }
    }
    i++;
  }
  return {
    children: children,
    variantChildren: variantChildren,
    inventoryChildren: inventoryChildren
  };
};


/**
* ReactionCore.Collections.Packages.after.update
* See: https://github.com/matb33/meteor-collection-hooks
*/

ReactionCore.Collections.Packages.after.update(function(userId, doc, fieldNames, modifier, options) {
  var _ref, _ref1, _ref2;
  if (((_ref = modifier.$set) != null ? (_ref1 = _ref.settings) != null ? _ref1.mail : void 0 : void 0) || ((_ref2 = modifier.$set) != null ? _ref2['settings.mail.user'] : void 0)) {
    if (Meteor.isServer) {
      return ReactionCore.configureMailUrl();
    }
  }
});

/**
* ReactionCore.Collections.Products.before.insert
* See: https://github.com/matb33/meteor-collection-hooks
*/
ReactionCore.Collections.Products.before.insert(function(userId, product) {
  var variant, _i, _len, _ref, _results;
  product.shopId = product.shopId || ReactionCore.getShopId();
  _.defaults(product, {
    type: "simple",
    handle: getSlug(product.title),
    isVisible: false,
    updatedAt: new Date,
    createdAt: new Date()
  });
  _ref = product.variants;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    variant = _ref[_i];
    _results.push(applyVariantDefaults(variant));
  }
  return _results;
});


/**
* ReactionCore.Collections.Products.before.update
* See: https://github.com/matb33/meteor-collection-hooks
*/
ReactionCore.Collections.Products.before.update(function(userId, product, fieldNames, modifier, options) {
  var addToSet, createdAt, differenceInQty, firstInventoryVariant, organizedChildren, originalInventoryQuantity, position, removedVariant, removedVariantId, runningQty, updatedAt, updatedInventoryQuantity, updatedVariant, updatedVariantId, variant, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
  ({
    updatedAt: new Date()
  });
  if (modifier.$push) {
    if (modifier.$push.variants) {
      applyVariantDefaults(modifier.$push.variants);
    }
  }
  if (((_ref = modifier.$set) != null ? (_ref1 = _ref['variants.$']) != null ? _ref1.inventoryQuantity : void 0 : void 0) >= 0 || ((_ref2 = modifier.$addToSet) != null ? (_ref3 = _ref2.variants) != null ? (_ref4 = _ref3.$each) != null ? _ref4[0].type : void 0 : void 0 : void 0) === 'inventory' || ((_ref5 = modifier.$addToSet) != null ? (_ref6 = _ref5.variants) != null ? _ref6.type : void 0 : void 0) === 'inventory' || ((_ref7 = modifier.$pull) != null ? (_ref8 = _ref7.variants) != null ? _ref8._id : void 0 : void 0)) {
    organizedChildren = organizedChildVariants(product);
    if ((_ref9 = modifier.$set) != null ? _ref9['variants.$'] : void 0) {
      updatedVariantId = modifier.$set['variants.$']._id;
      updatedVariant = modifier.$set['variants.$'];
      updatedInventoryQuantity = modifier.$set['variants.$'].inventoryQuantity;
      originalInventoryQuantity = ((function() {
        var _i, _len, _ref10, _results;
        _ref10 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref10.length; _i < _len; _i++) {
          variant = _ref10[_i];
          if (variant._id === updatedVariantId) {
            _results.push(variant);
          }
        }
        return _results;
      })())[0].inventoryQuantity || 0;
      differenceInQty = updatedInventoryQuantity - originalInventoryQuantity;
    } else if ((_ref10 = modifier.$pull) != null ? (_ref11 = _ref10.variants) != null ? _ref11._id : void 0 : void 0) {
      removedVariantId = modifier.$pull['variants']._id;
      removedVariant = ((function() {
        var _i, _len, _ref12, _results;
        _ref12 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref12.length; _i < _len; _i++) {
          variant = _ref12[_i];
          if (variant._id === removedVariantId) {
            _results.push(variant);
          }
        }
        return _results;
      })())[0];
      if (removedVariant.parentId) {
        updatedVariantId = removedVariant.parentId;
        updatedVariant = ((function() {
          var _i, _len, _ref12, _results;
          _ref12 = product.variants;
          _results = [];
          for (_i = 0, _len = _ref12.length; _i < _len; _i++) {
            variant = _ref12[_i];
            if (variant._id === updatedVariantId) {
              _results.push(variant);
            }
          }
          return _results;
        })())[0];
        if (removedVariant.inventoryQuantity) {
          differenceInQty = -removedVariant.inventoryQuantity;
        } else {
          differenceInQty = -1;
        }
      } else {
        updatedVariant = {
          parentId: null
        };
        updatedVariantId = null;
        differenceInQty = null;
      }
    } else if (((_ref12 = modifier.$addToSet) != null ? (_ref13 = _ref12.variants) != null ? _ref13.type : void 0 : void 0) === 'inventory') {
      updatedVariantId = modifier.$addToSet['variants'].parentId;
      updatedVariant = ((function() {
        var _i, _len, _ref14, _results;
        _ref14 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref14.length; _i < _len; _i++) {
          variant = _ref14[_i];
          if (variant._id === updatedVariantId) {
            _results.push(variant);
          }
        }
        return _results;
      })())[0];
      differenceInQty = 1;
      firstInventoryVariant = ((function() {
        var _i, _len, _ref14, _results;
        _ref14 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref14.length; _i < _len; _i++) {
          variant = _ref14[_i];
          if (variant.parentId === updatedVariantId && variant.type === 'inventory') {
            _results.push(variant);
          }
        }
        return _results;
      })()).length === 0;
      if (firstInventoryVariant) {
        differenceInQty = 1 - updatedVariant.inventoryQuantity;
      }
    } else if ((_ref14 = modifier.$addToSet) != null ? (_ref15 = _ref14.variants) != null ? _ref15.$each[0].type = 'inventory' : void 0 : void 0) {
      updatedVariantId = modifier.$addToSet['variants'].$each[0].parentId;
      updatedVariant = ((function() {
        var _i, _len, _ref16, _results;
        _ref16 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref16.length; _i < _len; _i++) {
          variant = _ref16[_i];
          if (variant._id === updatedVariantId) {
            _results.push(variant);
          }
        }
        return _results;
      })())[0];
      differenceInQty = modifier.$addToSet['variants'].$each.length;
      firstInventoryVariant = ((function() {
        var _i, _len, _ref16, _results;
        _ref16 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref16.length; _i < _len; _i++) {
          variant = _ref16[_i];
          if (variant.parentId === updatedVariantId && variant.type === 'inventory') {
            _results.push(variant);
          }
        }
        return _results;
      })()).length === 0;
      if (firstInventoryVariant && updatedVariant.inventoryQuantity) {
        differenceInQty = differenceInQty - updatedVariant.inventoryQuantity;
      }
    }
    while (true) {
      if (!updatedVariantId) {
        break;
      }
      runningQty = 0;
      if (((_ref16 = organizedChildren.variantChildren[updatedVariantId]) != null ? _ref16.constructor : void 0) === Array) {
        runningQty += organizedChildren.variantChildren[updatedVariantId].reduce((function(total, child) {
          return total + (child.inventoryQuantity || 0);
        }), 0);
      }
      if ((_ref17 = organizedChildren.inventoryChildren[updatedVariantId]) != null ? _ref17.length : void 0) {
        runningQty += organizedChildren.inventoryChildren[updatedVariantId].length;
      }
      if (differenceInQty) {
        runningQty += differenceInQty;
      }
      if (!organizedChildren.children[updatedVariantId]) {
        runningQty += updatedVariant.inventoryQuantity || 0;
      }
      Products.direct.update({
        '_id': product._id,
        'variants._id': updatedVariantId
      }, {
        $set: {
          'variants.$.inventoryQuantity': runningQty
        }
      });
      if (!updatedVariant.parentId) {
        break;
      }
      updatedVariantId = updatedVariant.parentId;
      updatedVariant = ((function() {
        var _i, _len, _ref18, _results;
        _ref18 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref18.length; _i < _len; _i++) {
          variant = _ref18[_i];
          if (variant._id === updatedVariantId) {
            _results.push(variant);
          }
        }
        return _results;
      })())[0];
    }
  }
  if (_.indexOf(fieldNames, 'positions') !== -1) {
    addToSet = (_ref18 = modifier.$addToSet) != null ? _ref18.positions : void 0;
    if (addToSet) {
      createdAt = new Date();
      updatedAt = new Date();
      if (addToSet.$each) {
        for (position in addToSet.$each) {
          createdAt = new Date();
          updatedAt = new Date();
        }
      } else {
        addToSet.updatedAt = updatedAt;
      }
    }
  }
  if (modifier.$set) {
    modifier.$set.updatedAt = new Date();
  }
  if ((_ref19 = modifier.$addToSet) != null ? _ref19.variants : void 0) {
    if (!modifier.$addToSet.variants.createdAt) {
      modifier.$addToSet.variants.createdAt = new Date();
    }
    if (!modifier.$addToSet.variants.updatedAt) {
      return modifier.$addToSet.variants.updatedAt = new Date();
    }
  }
});
