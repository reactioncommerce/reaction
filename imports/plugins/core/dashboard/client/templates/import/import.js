import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { FileRecord } from "@reactioncommerce/file-collections";
import { Logger, Reaction } from "/client/api";
import { Products } from "/lib/collections";
import { Media } from "/imports/plugins/core/files/client";

function uploadHandler(event) {
  const shopId = Reaction.getShopId();
  const userId = Meteor.userId();
  const { files } = event.target.files;

  for (let i = 0; i < files.length; i += 1) {
    const parts = files[i].name.split(".");
    let product;
    if (parts[0]) {
      product = Products.findOne({
        "variants.barcode": parts[0]
      }, {
        variants: {
          $elemMatch: {
            barcode: parts[0]
          }
        }
      });
    }
    if (product) {
      const fileRecord = FileRecord.fromFile(files[i]);
      fileRecord.metadata = {
        ownerId: userId,
        productId: product._id,
        variantId: product.variants[0]._id,
        shopId,
        priority: Number(parts[1]) || 0
      };
      fileRecord.upload()
        .then(() => Media.insert(fileRecord))
        .catch((error) => {
          Logger.error(error);
        });
    }
  }
}

Template.import.events({
  "submit form#form-import-images"(event) {
    event.preventDefault();
    uploadHandler(event);
  }
});
