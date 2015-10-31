/**
 * organizedChildVariants
 * helper that gives us a few organized objects of child variants organized
 * by parentId.
 * returns an object that contains the following
 *   children: object with arrays of all children for each parent
 *   variantChildren: object with arrays of all children that are not type 'inventory' for each parent
 *   inventoryChildren: object arrays of all children that are type inventory for each parent
 * @param {Object} product - product object
 * @return {Object} child variant hierarchy
 */
organizedChildVariants = function (product) {
  let children = {};
  let inventoryChildren = {};
  let variantChildren = {};
  for (let currentVariant of product.variants) {
    // If currentVariant's parentId matches variant._id, it's a child
    if (currentVariant.parentId) {
      if (!children[currentVariant.parentId]) {
        children[currentVariant.parentId] = [];
      }
      children[currentVariant.parentId].push(currentVariant);

      // if currentVariant's type is 'inventory' it's an inventory variant
      if (currentVariant.type === "inventory") {
        if (!inventoryChildren[currentVariant.parentId]) {
          inventoryChildren[currentVariant.parentId] = [];
        }
        inventoryChildren[currentVariant.parentId].push(currentVariant);
        // Otherwise it's a standard variant that could have children of it's own.
      } else {
        if (!variantChildren[currentVariant.parentId]) {
          variantChildren[currentVariant.parentId] = [];
        }
        variantChildren[currentVariant.parentId].push(currentVariant);
      }
    }
  }

  const organizedChildren = {
    children: children,
    variantChildren: variantChildren,
    inventoryChildren: inventoryChildren
  };

  return organizedChildren;
};

/**
 * Inventory Methods
 */
Meteor.methods({
  "inventory/register": function (product) {
    // adds or updates inventory collection with this product
    check(product, ReactionCore.Schemas.Product);
  },
  "inventory/adjust": function (product) {
    check(product, ReactionCore.Schemas.Product);
    productType = product.type; // a master grouping that identifies this product schema and workflow
    variantsTypes = []; // array of variants that make up this product
    // reduce variant types.
    // for (let variant of product.variants) {
    //   variantTypes.push(variant.type);
    // }
    variantTypes = product.variants.map(variant => variant.age);
    console.log(variantTypes);

    // workflow schema added to products collection

    return variantTypes;
  },
  "inventory/addHold": function (product) {
    check(product, ReactionCore.Schemas.Product);
  },
  "inventory/clearHold": function (product) {
    check(product, ReactionCore.Schemas.Product);
  },
  "inventory/lowStock": function (product) {
    check(product, ReactionCore.Schemas.Product);
  },
  "inventory/shipped": function (product) {
    check(product, ReactionCore.Schemas.Product);
  },
  "inventory/return": function (product) {
    check(product, ReactionCore.Schemas.Product);
  }
});
