/**
 * productImageGallery helpers
 */

let Media = ReactionCore.Collections.Media;

/**
 * uploadHandler method
 */

function uploadHandler(event) {
  const productId = ReactionProduct.selectedProductId();
  const variantId = ReactionProduct.selectedVariantId();
  const shopId = ReactionProduct.selectedProduct().shopId || ReactionCore.getShopId();
  const userId = Meteor.userId();
  let count = Media.find({
    "metadata.variantId": variantId
  }).count();

  return FS.Utility.eachFile(event, function (file) {
    let fileObj;
    fileObj = new FS.File(file);
    fileObj.metadata = {
      ownerId: userId,
      productId: productId,
      variantId: variantId,
      shopId: shopId,
      priority: count
    };
    Media.insert(fileObj);
    return count++;
  });
}

/**
 * updateImagePriorities method
 */

function updateImagePriorities() {
  const sortedMedias = _.map($(".gallery").sortable("toArray", {
    attribute: "data-index"
  }), function (index) {
    return {
      mediaId: index
    };
  });

  const results = [];
  for (let image of sortedMedias) {
    results.push(Media.update(image.mediaId, {
      $set: {
        "metadata.priority": _.indexOf(sortedMedias, image)
      }
    }));
  }
  return results;
}

/**
 *  Product Image Gallery
 */

Template.productImageGallery.helpers({
  media: function () {
    let mediaArray = [];
    const variant = ReactionProduct.selectedVariant();
    const product = ReactionProduct.selectedProduct();

    if (variant) {
      mediaArray = Media.find({
        "metadata.variantId": variant._id
      }, {
        sort: {
          "metadata.priority": 1
        }
      });
      if (!ReactionCore.hasAdminAccess() && mediaArray.count() < 1 && product) {
        mediaArray = Media.find({
          "metadata.variantId": product.variants[0]._id
        }, {
          sort: {
            "metadata.priority": 1
          }
        });
      }
    } else {
      if (product) {
        let ids = [];
        for (let thisVariant of product.variants) {
          ids.push(thisVariant._id);
        }
        mediaArray = Media.find({
          "metadata.variantId": {
            $in: ids
          }
        }, {
          sort: {
            "metadata.priority": 1
          }
        });
      }
    }
    return mediaArray;
  },
  variant: function () {
    return ReactionProduct.selectedVariant();
  }
});

/**
 * productImageGallery onRendered
 */

Template.productImageGallery.onRendered(function () {
  return this.autorun(function () {
    let $gallery;
    if (ReactionCore.hasAdminAccess()) {
      $gallery = $(".gallery");
      return $gallery.sortable({
        cursor: "move",
        opacity: 0.3,
        placeholder: "sortable",
        forcePlaceholderSize: true,
        update: function () {
          let variant;
          if (variant && variant._id) {
            variant = ReactionProduct.selectedVariant();
          }
          variant.medias = [];
          return updateImagePriorities();
        },
        start: function (event, ui) {
          ui.placeholder.html("Drop image to reorder");
          ui.placeholder.css("padding-top", "30px");
          ui.placeholder.css("border", "1px dashed #ccc");
          return ui.placeholder.css("border-radius", "6px");
        }
      });
    }
  });
});

/**
 * productImageGallery events
 */

Template.productImageGallery.events({
  "mouseenter .gallery > li": function (event) {
    let ids = [];
    event.stopImmediatePropagation();
    if (!ReactionCore.hasPermission("createProduct")) {
      let first = $(".gallery li:nth-child(1)");
      let target = $(event.currentTarget);
      let variant = ReactionProduct.selectedVariant();

      if (!variant) {
        let product = ReactionProduct.selectedProduct();
        if (product) {
          for (let productVariant of product.variants) {
            let mediaResults = Media.find({
              "metadata.variantId": productVariant._id
            }, {
              sort: {
                "metadata.priority": 1
              }
            }).fetch();
            // loop within product variants
            for (let media of mediaResults) {
              ids.push(media._id);
              if ($(event.currentTarget).data("index") === media._id) {
                ReactionProduct.setCurrentVariant(productVariant._id);
              }
            }
            if (ReactionProduct.selectedVariant()) {
              break;
            }
          }
        }

        /*
        hide all images not associated with the highlighted variant
        to prevent the alternate variant images from being displayed.
         */
        if (ids.length > 0) {
          $(".gallery li").each(function (k, v) {
            let vId = $(v).data("index");
            if (_.indexOf(ids, vId) < 0) {
              return $(v).hide();
            }
          });
        }
      }
      if ($(target).data("index") !== first.data("index")) {
        return $(".gallery li:nth-child(1)").fadeOut(400, function () {
          $(this).replaceWith(target);
          first.css({
            display: "inline-block"
          }).appendTo($(".gallery"));
          return $(".gallery li:last-child").fadeIn(100);
        });
      }
    }
  },
  "click .remove-image": function () {
    this.remove();
    updateImagePriorities();
  },
  "dropped #galleryDropPane": uploadHandler
});

/**
 * imageUploader events
 */

Template.imageUploader.events({
  "click #btn-upload": function () {
    return $("#files").click();
  },
  "change #files": uploadHandler,
  "dropped #dropzone": uploadHandler
});

/**
 * productImageGallery events
 */

Template.productImageGallery.events({
  "click #img-upload": function () {
    return $("#files").click();
  },
  "load .img-responsive": function (event, template) {
    return Session.set("variantImgSrc", template.$(".img-responsive").attr(
      "src"));
  }
});
