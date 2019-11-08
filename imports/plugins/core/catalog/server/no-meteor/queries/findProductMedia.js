import Logger from "@reactioncommerce/logger";

export default async function findProductMedia(context, variantId, productId) {
  try {
    const {
      collections: { Products }
    } = context;
    // variant images have greater priority than simple images
    const relatedProducts = await Products.find(
      {
        _id: {
          $in: [variantId, productId]
        }
      },
      {
        sort: {
          type: -1
        }
      }
    ).toArray();

    let media = [{ 
      URLs: {},
      productId,
      variantId,
      toGrid: 0,
      priority: 1
    }];

    for (const relatedProduct of relatedProducts) {
      if (!media[0].URLs.original) {
        const promises = relatedProduct.metafields.map(async (metafield) => {
          if (metafield.namespace === "1") {
            if (metafield.valueType === "medium") {
              media[0].URLs.medium = metafield.value;
            }
            if (metafield.valueType === "original") {
              media[0].URLs.large = metafield.value;
              media[0].URLs.original = metafield.value;
            }
            if (metafield.valueType === "small") {
              media[0].URLs.small = metafield.value;
            }
            if (metafield.valueType === "thumbnail") {
              media[0].URLs.thumbnail = metafield.value;
            }
          }
        });
        await Promise.all(promises);
      }
    }

    return { variant: { media: (media[0].URLs.original) ? media : [] } };
  } catch (err) {
    Logger.error("Error occured during image preperation", err);
    return { variant: { media: [] } };
  }
}
