/**
 * getVariantPriceOrPricePerDayRange
 * @summary get pricePerDay range if rental or price range of a variant if it has child options.
 * if no child options, return main price or pricePerDay value
 * @todo remove string return and replace with object
 * @param {String} currentVariantId - currentVariantId
 * @param {String} currentProductId - currentProductId
 * @return {String} formatted pricePerDay/price or pricePerDay/price range
 */
this.getVariantPriceOrPricePerDayRange = function (currentVariantId, currentProductId) {
  let productId = currentProductId || selectedProductId();
  let variantId = currentVariantId || selectedVariant()._id;

  let product = Products.findOne(productId);
  if (!(variantId && productId && product)) {
    return undefined;
  }

  // Setup priceType so we can access either pricePerDay or price easily and accurately.
  // e.g. variant[priceType] is equivilent to variant.price or variant.pricePerDay
  let priceType = product.type === 'rental' ? 'pricePerDay' : 'price';
  let variant = _.findWhere(product.variants, {
    _id: variantId
  });

  let children = (function () {
    let results = [];
    for (let thisVariant of product.variants) {
      if (thisVariant.parentId === variantId) {
        results.push(thisVariant);
      }
    }
    return results;
  })();

  if (children.length === 0) {
    if (variant && variant[priceType]) {
      return variant[priceType];
    }
    return undefined;
  }

  if (children.length === 1) {
    return children[0][priceType];
  }

  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = Number.NEGATIVE_INFINITY;

  for (let child of children) {
    if (child[priceType] < priceMin) {
      priceMin = child[priceType];
    }
    if (child[priceType] > priceMax) {
      priceMax = child[priceType];
    }
  }
  if (priceMin === priceMax) {
    return priceMin;
  }
  return `${priceMin} - ${priceMax}`;
};

/**
 * getProductPriceOrPricePerDayRange
 * @summary get price range of a product
 * if no only one price available, return it
 * otherwise return a string range
 * @todo remove string return and replace with object
 * @param {String} currentProductId - currentProductId
 * @return {String} formatted price or price range
 */
this.getProductPriceOrPricePerDayRange = function (currentProductId) {
  let productId = currentProductId || selectedProductId();
  let product = Products.findOne(productId);

  if (!product) {
    return undefined;
  } else if (!product._id) {
    return undefined;
  }

  let variants = (function () {
    let results = [];
    for (let variant of product.variants) {
      if (!variant.parentId) {
        results.push(variant);
      }
    }
    return results;
  })();

  if (variants.length > 0) {
    let variantPrices = [];
    for (let variant of variants) {
      let range = getVariantPriceOrPricePerDayRange(variant._id, productId);
      if (Match.test(range, String)) {
        let firstPrice = parseFloat(range.substr(0, range.indexOf(' ')));
        let lastPrice = parseFloat(range.substr(range.lastIndexOf(' ') + 1));
        variantPrices.push(firstPrice, lastPrice);
      } else {
        variantPrices.push(range);
      }
    }
    let priceMin = _.min(variantPrices);
    let priceMax = _.max(variantPrices);
    if (priceMin === priceMax) {
      return priceMin;
    }
    return `${priceMin} - ${priceMax}`;
  }
};
