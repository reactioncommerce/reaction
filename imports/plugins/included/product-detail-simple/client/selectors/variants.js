import { ReactionProduct } from "/lib/api";

export function getChildVariants() {
  const childVariants = [];
  const variants = ReactionProduct.getVariants();
  if (variants.length > 0) {
    const current = ReactionProduct.selectedVariant();

    if (!current) {
      return [];
    }

    if (current.ancestors.length === 1) {
      variants.map((variant) => {
        if (typeof variant.ancestors[1] === "string" &&
          variant.ancestors[1] === current._id &&
          variant.optionTitle &&
          variant.type !== "inventory") {
          childVariants.push(variant);
        }
        return childVariants;
      });
    } else {
      // TODO not sure we need this part...
      variants.map((variant) => {
        if (typeof variant.ancestors[1] === "string" &&
          variant.ancestors.length === current.ancestors.length &&
          variant.ancestors[1] === current.ancestors[1] &&
          variant.optionTitle
        ) {
          childVariants.push(variant);
        }
        return childVariants;
      });
    }

    return childVariants;
  }

  return null;
}
