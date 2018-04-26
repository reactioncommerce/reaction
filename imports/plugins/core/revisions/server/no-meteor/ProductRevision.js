const ProductRevision = {
  async getProductPriceRange(productId, collections) {
    const { Products } = collections;
    const product = await Products.findOne(productId);
    if (!product) {
      return {
        range: "0",
        min: 0,
        max: 0
      };
    }

    const variants = await this.getTopVariants(product._id, collections);
    if (variants.length > 0) {
      const variantPrices = [];
      await Promise.all(
        variants.map(async (variant) => {
          if (variant.isVisible === true) {
            const range = await this.getVariantPriceRange(variant._id, collections);
            if (typeof range === "string") {
              const firstPrice = parseFloat(range.substr(0, range.indexOf(" ")));
              const lastPrice = parseFloat(range.substr(range.lastIndexOf(" ") + 1));
              variantPrices.push(firstPrice, lastPrice);
            } else {
              variantPrices.push(range);
            }
          } else {
            variantPrices.push(0, 0);
          }
        })
      );

      const priceMin = variantPrices.reduce((currentMin, price) => (price < currentMin ? price : currentMin), Infinity);
      const priceMax = variantPrices.reduce((currentMax, price) => (price > currentMax ? price : currentMax), 0);

      let priceRange = `${priceMin} - ${priceMax}`;
      // if we don't have a range
      if (priceMin === priceMax) {
        priceRange = priceMin.toString();
      }
      const priceObject = {
        range: priceRange,
        min: priceMin,
        max: priceMax
      };
      return priceObject;
    }

    if (!product.price) {
      return {
        range: "0",
        min: 0,
        max: 0
      };
    }

    // if we have no variants subscribed to (client)
    // we'll get the price object previously from the product
    return product.price;
  },

  async getVariantPriceRange(variantId, collections) {
    const children = await this.getVariants(variantId, null, collections);
    const visibleChildren = children.filter((child) => child.isVisible && !child.isDeleted);

    switch (visibleChildren.length) {
      case 0: {
        const topVariant = await this.getProduct(variantId, collections);
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
  },

  async findRevision(documentId, collections) {
    const { Revisions } = collections;
    return Revisions.findOne({
      documentId,
      "workflow.status": {
        $nin: ["revision/published"]
      }
    });
  },

  async getProduct(variantId, collections) {
    const { Products } = collections;
    const product = await Products.findOne(variantId);
    const revision = await this.findRevision(
      {
        documentId: variantId
      },
      collections
    );

    return (revision && revision.documentData) || product;
  },

  async getTopVariants(productId, collections) {
    const { Products } = collections;
    const variants = [];

    const products = await Products.find({
      ancestors: [productId],
      type: "variant",
      isDeleted: false
    }).toArray();

    await Promise.all(
      products.map(async (product) => {
        const revision = await this.findRevision(
          {
            documentId: product._id
          },
          collections
        );

        if (revision && revision.documentData.isVisible) {
          variants.push(revision.documentData);
        } else if (!revision && product.isVisible) {
          variants.push(product);
        }

        return variants;
      })
    );

    return variants;
  },

  async getVariants(proudctOrVariantId, type, collections) {
    const { Products } = collections;
    const variants = [];

    const products = await Products.find({
      ancestors: proudctOrVariantId,
      type: type || "variant",
      isDeleted: false
    }).toArray();

    await Promise.all(
      products.map(async (product) => {
        const revision = await this.findRevision(
          {
            documentId: product._id
          },
          collections
        );

        if (revision && revision.documentData.isVisible) {
          variants.push(revision.documentData);
        } else if (!revision && product.isVisible) {
          variants.push(product);
        }
      })
    );
    return variants;
  },

  async getVariantQuantity(variant, collections, variants) {
    let options;
    if (variants) {
      options = variants.filter((option) => option.ancestors[1] === variant._id);
    } else {
      options = await this.getVariants(variant._id, null, collections);
    }

    if (options && options.length) {
      return options.reduce((sum, option) => sum + option.inventoryQuantity || 0, 0);
    }
    return variant.inventoryQuantity || 0;
  }
};

export default ProductRevision;
