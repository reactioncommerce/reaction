import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Products, Catalog } from "/lib/collections";
import { Logger } from "/server/api";
import { Media } from "/imports/plugins/core/files/server";

export async function publishProductToCatalog(productId) {
  check(productId, String);
console.log("PID", productId);

  let product = Products.findOne({
    $or: [
      { _id: productId },
      { ancestors: { $in: [productId] } }
    ]
  });

  if (!product) {
    throw new Meteor.error("error", "Cannot publish product");
  }

  if (Array.isArray(product.ancestors) && product.ancestors.length) {
    product = Products.findOne({
      _id: product.ancestors[0]
    });
  }

  const variants = Products.find({
    ancestors: {
      $in: [productId]
    }
  }).fetch();

  const mediaArray = await Media.find({
    "metadata.productId": productId
  });

  const productMedia = mediaArray.map((media) => ({
    thumbnail: `${media.url({ store: "thumbnail" })}`,
    small: `${media.url({ store: "small" })}`,
    medium: `${media.url({ store: "medium" })}`,
    large: `${media.url({ store: "large" })}`
  }));

  console.log("mediaArray", productMedia);

  product.varaints = variants;
  product.isSoldOut = true;
  product.media = productMedia;

  return Catalog.upsert({
    _id: productId
  }, {
    $set: product
  }, {
    multi: true,
    upsert: true,
    validate: false
  });
}

Meteor.methods({
  "catalog/publishProduct": publishProductToCatalog
});
