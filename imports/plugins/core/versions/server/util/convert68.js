import isEqual from "lodash/isEqual";

const ALL_FIELDS = [
  "canBackorder",
  "inventoryAvailableToSell",
  "inventoryInStock",
  "inventoryReserved",
  "isBackorder",
  "isLowQuantity",
  "isSoldOut"
];

const DEFAULT_SELLABLE_INFO = {
  canBackorder: true,
  inventoryAvailableToSell: 0,
  inventoryInStock: 0,
  inventoryReserved: 0,
  isBackorder: false,
  isLowQuantity: false,
  isSoldOut: false
};

const DEFAULT_SOLD_OUT_INFO = {
  canBackorder: false,
  inventoryAvailableToSell: 0,
  inventoryInStock: 0,
  inventoryReserved: 0,
  isBackorder: false,
  isLowQuantity: true,
  isSoldOut: true
};

/**
 * @summary Returns an object with inventory information for one or more
 *   product configurations. For performance.
 * @param {Object} collections Mongo collection
 * @param {Object} input Additional input arguments
 * @param {Object[]} input.productConfigurations An array of ProductConfiguration objects
 *   you have already looked them up. This will save a database query.
 * @param {Object[]} input.canSellWithoutInventory App settings that indicates whether products
 * can be sold without inventory tracking enabled.
 * @return {Promise<Object[]>} Array of responses, in same order as `input.productConfigurations` array.
 */
async function getInventoryResults(collections, input) {
  const { SimpleInventory } = collections;
  const { productConfigurations, canSellWithoutInventory } = input;
  const results = [];
  let remainingProductConfigurations = productConfigurations;

  const productVariantIds = productConfigurations.map(({ productVariantId }) => productVariantId);

  const inventoryDocs = await SimpleInventory
    .find({
      "productConfiguration.productVariantId": { $in: productVariantIds }
    })
    .limit(productConfigurations.length) // optimize query speed
    .toArray();

  const inventoryResults = productConfigurations.map((productConfiguration) => {
    const inventoryDoc = inventoryDocs.find((doc) => isEqual(productConfiguration, doc.productConfiguration));
    if (!inventoryDoc || !inventoryDoc.isEnabled) {
      return {
        inventoryInfo: null,
        productConfiguration
      };
    }

    const { canBackorder, lowInventoryWarningThreshold } = inventoryDoc;
    let { inventoryInStock, inventoryReserved } = inventoryDoc;
    inventoryInStock = Math.max(0, inventoryInStock);
    inventoryReserved = Math.max(0, inventoryReserved);
    const inventoryAvailableToSell = Math.max(0, inventoryInStock - inventoryReserved);
    const isLowQuantity = inventoryAvailableToSell <= lowInventoryWarningThreshold;

    return {
      inventoryInfo: {
        canBackorder,
        inventoryAvailableToSell,
        inventoryInStock,
        inventoryReserved,
        isLowQuantity
      },
      productConfiguration
    };
  });

  // Add only those with inventory info to final results.
  // Otherwise add to sellableProductConfigurations for next run
  remainingProductConfigurations = [];
  for (const inventoryResult of inventoryResults) {
    if (inventoryResult.inventoryInfo) {
      inventoryResult.inventoryInfo.isSoldOut = inventoryResult.inventoryInfo.inventoryAvailableToSell === 0;
      inventoryResult.inventoryInfo.isBackorder = inventoryResult.inventoryInfo.isSoldOut && inventoryResult.inventoryInfo.canBackorder;
      results.push(inventoryResult);
    } else {
      remainingProductConfigurations.push(inventoryResult.productConfiguration);
    }
  }


  // If no inventory info was found for some of the product configs, such as
  // if there are no plugins providing inventory info, then use default info
  // that allows the product to be purchased always.
  if (remainingProductConfigurations.length > 0) {
    const inventoryInfo = canSellWithoutInventory ? DEFAULT_SELLABLE_INFO : DEFAULT_SOLD_OUT_INFO;
    for (const productConfiguration of remainingProductConfigurations) {
      results.push({ inventoryInfo, productConfiguration });
    }
  }

  return results;
}

/**
 * @summary Returns an object with inventory information for one or more
 *   product configurations.
 * @param {Object} collections Mongo collections
 * @param {Object} input Additional input arguments
 * @param {Object[]} input.productConfigurations An array of ProductConfiguration objects
 * @param {String[]} [input.fields] Optional array of fields you need. If you don't need all,
 *   you can pass this to skip some calculations and database lookups, improving speed.
 * @param {Object[]} input.shopId Shop id
 * @param {Object[]} input.canSellWithoutInventory App settings that indicates whether products
 * can be sold without inventory tracking enabled.
 * @return {Promise<Object[]>} Array of responses. Order is not guaranteed to be the same
 *   as `input.productConfigurations` array.
 */
async function inventoryForProductConfigurations(collections, input) {
  const { Products } = collections;

  const { fields = ALL_FIELDS, productConfigurations, shopId, canSellWithoutInventory } = input;

  // Inventory plugins are expected to provide inventory info only for sellable variants.
  // If there are any non-sellable parent variants in the list, we remove them now.
  // We'll aggregate their child option values after we get them.
  const parentVariantProductConfigurations = [];
  const sellableProductConfigurations = [];
  for (const productConfiguration of productConfigurations) {
    const { isSellable, ...coreProductConfiguration } = productConfiguration;
    if (isSellable) {
      sellableProductConfigurations.push(coreProductConfiguration);
    } else {
      parentVariantProductConfigurations.push(coreProductConfiguration);
    }
  }

  // Get results for sellable product configs
  const results = await getInventoryResults(collections, {
    fields,
    productConfigurations: sellableProductConfigurations,
    shopId,
    canSellWithoutInventory
  });

  // Now it's time to calculate top-level variant aggregated inventory and add those to the results.
  // For non-sellable (parent) variants, we need to get inventory for all of their options
  // and calculate aggregated values from them.
  let childOptionResults = [];
  if (parentVariantProductConfigurations.length) {
    const variantIds = parentVariantProductConfigurations.map(({ productVariantId }) => productVariantId);
    const allOptions = await Products.find({
      ancestors: { $in: variantIds }
    }, {
      projection: {
        ancestors: 1
      }
    }).toArray();

    childOptionResults = await getInventoryResults(collections, {
      fields,
      productConfigurations: allOptions.map((option) => ({
        productId: option.ancestors[0],
        productVariantId: option._id
      })),
      shopId,
      canSellWithoutInventory
    });

    for (const productConfiguration of parentVariantProductConfigurations) {
      const childOptions = allOptions.filter((option) => option.ancestors.includes(productConfiguration.productVariantId));
      const childOptionsInventory = childOptions.reduce((list, option) => {
        const optionResult = childOptionResults.find((result) => result.productConfiguration.productVariantId === option._id);
        if (optionResult) list.push(optionResult.inventoryInfo);
        return list;
      }, []);
      results.push({
        productConfiguration,
        inventoryInfo: {
          canBackorder: childOptionsInventory.some((option) => option.canBackorder),
          inventoryAvailableToSell: childOptionsInventory.reduce((sum, option) => sum + option.inventoryAvailableToSell, 0),
          inventoryInStock: childOptionsInventory.reduce((sum, option) => sum + option.inventoryInStock, 0),
          inventoryReserved: childOptionsInventory.reduce((sum, option) => sum + option.inventoryReserved, 0),
          isBackorder: childOptionsInventory.every((option) => option.isBackorder),
          isLowQuantity: childOptionsInventory.some((option) => option.isLowQuantity),
          isSoldOut: childOptionsInventory.every((option) => option.isSoldOut)
        }
      });
    }
  }

  return results;
}

/**
 * @param {Object} catalogProduct The catalog item to transform
 * @param {Object} collections The catalog item to transform
 * @returns {Object} The converted item document
 */
export async function convertCatalogItemVariants(catalogProduct, collections) {
  const { AppSettings, Products } = collections;

  const shopSettings = await AppSettings.findOne({ shopId: catalogProduct.shopId });

  // By default, products that do not have inventory management enabled are sellable.
  let canSellWithoutInventory = true;
  if (shopSettings && typeof shopSettings.canSellVariantWithoutInventory === "boolean") {
    canSellWithoutInventory = shopSettings.canSellVariantWithoutInventory;
  }

  const variants = await Products.find({
    ancestors: catalogProduct.product.productId,
    isDeleted: { $ne: true },
    isVisible: true
  }, {
    _id: 1,
    ancestors: 1,
    shopId: 1
  }).toArray();

  const topVariantsAndTopOptions = variants.filter((variant) => variant.ancestors.length === 1 || variant.ancestors.length === 2);
  if (topVariantsAndTopOptions.length === 0) return catalogProduct;

  const variantsOptionsInventory = await inventoryForProductConfigurations(collections, {
    fields: ["isBackorder", "isLowQuantity", "isSoldOut"],
    productConfigurations: topVariantsAndTopOptions.map((option) => ({
      isSellable: !variants.some((variant) => variant.ancestors.includes(option._id)),
      productId: option.ancestors[0],
      productVariantId: option._id
    })),
    shopId: topVariantsAndTopOptions[0].shopId,
    canSellWithoutInventory

  });

  // Update inventory for the parent product and all variants and options.
  // If no inventory information is found for a variant or option, it is not mutated.
  const updatedVariants = [];
  catalogProduct.product.variants.forEach((variant) => {
    // Keep variant un-mutated by default
    let updatedVariant = variant;
    const foundVariantInventory = variantsOptionsInventory.find((inventoryInfo) => inventoryInfo.productConfiguration.productVariantId === variant._id);

    if (foundVariantInventory.inventoryInfo) {
      updatedVariant = {
        ...variant,
        isSoldOut: foundVariantInventory.inventoryInfo.isSoldOut
      };
    }

    const updatedOptions = [];
    if (updatedVariant.options) {
      updatedVariant.options.forEach((option) => {
        // Keep option un-mutated by default
        let updatedOption = option;
        const foundOptionInventory = variantsOptionsInventory.find((inventoryInfo) => inventoryInfo.productConfiguration.productVariantId === option._id);

        if (foundVariantInventory.inventoryInfo) {
          updatedOption = {
            ...option,
            isSoldOut: foundOptionInventory.inventoryInfo.isSoldOut
          };
        }

        updatedOptions.push(updatedOption);
      });

      updatedVariant.options = updatedOptions;
    }

    updatedVariants.push(updatedVariant);
  });

  const updatedCatalogProduct = {
    ...catalogProduct.product,
    variants: updatedVariants
  };

  const doc = {
    _id: catalogProduct._id,
    product: updatedCatalogProduct,
    shopId: catalogProduct.shopId,
    createdAt: catalogProduct.createdAt
  };

  return doc;
}
