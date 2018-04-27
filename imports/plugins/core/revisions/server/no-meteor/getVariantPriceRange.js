import getProduct from "./getProduct";
import getVariants from "./getVariants";

/**
 * TODO:
 * @method
 * @summary
 * @param
 * @param
 * @return
 */
export default async function getVariantPriceRange(variantId, collections) {
  const children = await getVariants(variantId, null, collections);
  const visibleChildren = children.filter((child) => child.isVisible && !child.isDeleted);

  switch (visibleChildren.length) {
    case 0: {
      const topVariant = await getProduct(variantId, collections);
      // topVariant could be undefined when we removing last top variant
      return topVariant && topVariant.price;
    }
    case 1: {
      return visibleChildren[0].price;
    }
    default: {
      let priceMin = Number.POSITIVE_INFINITY;
      let priceMax = Number.NEGATIVE_INFINITY;

      visibleChildren.forEach((child) => {
        if (child.price < priceMin) {
          priceMin = child.price;
        }
        if (child.price > priceMax) {
          priceMax = child.price;
        }
      });

      if (priceMin === priceMax) {
        // TODO check impact on i18n/formatPrice from moving return to string
        return priceMin.toString();
      }
      return `${priceMin} - ${priceMax}`;
    }
  }
}
