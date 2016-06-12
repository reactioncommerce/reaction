import { Reaction } from "/client/api";
import { Media, Products } from "/lib/collections";

function uploadHandler(event) {
  let shopId = Reaction.getShopId();
  let userId = Meteor.userId();
  let files = event.target.files.files;

  for (let i = 0; i < files.length; i++) {
    let parts = files[i].name.split(".");
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
      let fileObj;
      fileObj = new FS.File(files[i]);
      fileObj.metadata = {
        ownerId: userId,
        productId: product._id,
        variantId: product.variants[0]._id,
        shopId: shopId,
        priority: Number(parts[1]) || 0
      };
      Media.insert(fileObj);
    }
  }
}

Template.import.events({
  "submit form#form-import-images": function (event) {
    event.preventDefault();
    uploadHandler(event);
  }
});
