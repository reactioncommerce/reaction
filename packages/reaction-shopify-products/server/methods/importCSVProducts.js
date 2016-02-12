function setupCSVProductDocument(product, skus) {
  // skus is an array of objects
  // each object represents a sku within single product.
  let prod = {}; // init empty object to hold new product.
  let sizes = {}; // object of sizes by color; Key is color;
  let colors = []; // array of keys

  // Create Product Object;
  prod.variants = [];
  prod.colors = [];
  prod.shopId = ReactionCore.getShopId();
  prod.shopifyId = product.shopifyId ? product.shopifyId.trim() : '';
  prod.vendor = product.vendor ? product.vendor.trim() : '';
  prod.gender = product.gender ? product.gender.trim() : '';
  prod.title = product.title ? product.title.trim() : '';
  prod.pageTitle = prod.title;
  prod.productType = product.productType ? product.productType.trim() : '';
  prod.description = prod.title;
  prod.handle = ImportProducts.handleize(prod.gender + ' ' + prod.title);
  prod.isVisible = false;

  // Build Sizes object
  _.each(skus, function (sku) {
    if (!_.contains(colors, sku.color)) {
      colors.push(sku.color);
      sizes[sku.color] = [{
        color: sku.color,
        size: sku.size,
        alternateSize: sku.numberSize,
        qty: sku.qty,
        sku: sku.sku,
        manufacturerSku: sku.manufacturerSku,
        location: sku.location,
        weight: sku.weight
      }];
    } else {
      sizes[sku.color].push({
        color: sku.color,
        size: sku.size,
        alternateSize: sku.numberSize,
        qty: sku.qty,
        sku: sku.sku,
        manufacturerSku: sku.manufacturerSku,
        location: sku.location,
        weight: sku.weight
      });
    }
  });

  _.each(colors, function (color) {
    prod.colors.push(color.trim());
    let childVariants = sizes[color];
    let variant = {};
    variant._id = Random.id();
    variant.type = 'variant';
    variant.title = color.trim();
    variant.optionTitle = 'color';
    variant.price = '1.00';
    variant.pricePerDay = '1.00';
    variant.inventoryQuantity = 0; // add to variant qty each loop through child
    variant.taxable = true;
    variant.weight = 1;
    prod.variants.push(variant);

    _.each(childVariants, function (child) {
      let childVariant = {};
      ReactionCore.Log.info('---------------' + prod.title + ' ' + child.color.trim() + ' ' + child.size.trim() + '---------------');
      ReactionCore.Log.info('-------------------------------------------------------------------------');
      childVariant._id = Random.id();
      childVariant.parentId = variant._id;
      childVariant.type = 'variant';
      childVariant.sku = child.sku.trim();
      childVariant.manufacturerSku = child.manufacturerSku.trim();
      childVariant.location = child.location.trim();
      childVariant.color = child.color.trim();
      childVariant.size = child.size.trim();
      childVariant.numberSize = child.alternateSize.trim();
      childVariant.title = 'size';
      childVariant.optionTitle = child.size.trim();
      childVariant.inventoryQuantity = parseInt(child.qty.trim(), 10);
      childVariant.compareAtPrice = '1.00';
      childVariant.price = '1.00';
      childVariant.pricePerDay = '1.00';
      childVariant.taxable = true;
      childVariant.weight = child.weight.trim() || 1;
      prod.variants.push(childVariant);
      // update parent inv qty
      variant.inventoryQuantity = variant.inventoryQuantity + parseInt(child.qty.trim(), 10);

      let qty = parseInt(child.qty.trim(), 10);
      // setup inventory variants
      _(qty).times(function (n) {
        if (n % 5 === 0) {
          ReactionCore.Log.info('Inventory number ' + n + ' of ' + qty);
        }
        let inventoryVariant = {};
        inventoryVariant.parentId = childVariant._id;
        inventoryVariant.shopId = prod.shopId;
        inventoryVariant.barcode = childVariant.sku + '-' + ImportProducts.paddedNumber(n);
        inventoryVariant.sku = childVariant.sku;
        inventoryVariant.color = childVariant.color;
        inventoryVariant.size = childVariant.size;
        ReactionCore.Collections.InventoryVariants.insert(inventoryVariant);
      });
    });
  });
  return prod;
}

Meteor.methods({
  'importCSVProducts/importProducts': function (productSkuList, updateIfExists = false) {
    check(productSkuList, [Match.Any]);
    check(updateIfExists, Match.Optional(Boolean));
    let Products = ReactionCore.Collections.Products;
    let products = _.groupBy(productSkuList, function (sku) {
      return sku.productId;
    });
    let index = 1;
    let numProducts = _.size(products);

    _.each(products, function (product) {
      let reactionProduct = setupCSVProductDocument(product[0], product);
      let existingProduct = '';
      if (reactionProduct.shopifyId) {
        existingProduct = Products.findOne({shopifyId: reactionProduct.shopifyId});
      }
      if (!updateIfExists && !existingProduct) {
        let status = 'Imported product ' + index + ' of ' + numProducts;
        Products.insert(reactionProduct);
        ImportProducts.updateImportStatus(status, {id: reactionProduct._id, title: reactionProduct.title});
      } else {
        if (existingProduct) {
          reactionProduct._id = existingProduct._id;
        }
        let status = '(Would have) Upserted product ' + index + ' of ' + numProducts;
        // Products.upsert(reactionProduct);
        ImportProducts.updateImportStatus(status, {id: reactionProduct._id, title: reactionProduct.title});
      }
      index = index + 1;
    });
    ReactionCore.Log.info('-------------------------------------------------------------------------');
    ReactionCore.Log.info('-------------------------Done Importing Products-------------------------');
    ReactionCore.Log.info('-------------------------------------------------------------------------');
    ImportProducts.updateImportStatus('Done importing CSV products');
  }
});
