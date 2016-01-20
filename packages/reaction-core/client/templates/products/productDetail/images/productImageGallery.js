/**
 * productImageGallery helpers
 */
let Media = ReactionCore.Collections.Media;
/*
 * uploadHandler method
 */
function uploadHandler(event) {
  let productId = selectedProductId();
  const variant = selectedVariant();
  if (typeof variant !== "object") {
    return Alerts.add("Please, create new Variant first.", "danger", {
      autoHide: true
    });
  }
  const variantId = variant._id;
  let shopId = selectedProduct().shopId || ReactionCore.getShopId();
  let userId = Meteor.userId();
  let count = Media.find({
    "metadata.variantId": variantId
  }).count();
  // TODO: we need to mark the first variant images somehow for productGrid.
  // But how do we know that this is the first, not second or other variant?
  // Question is open. For now if product has more than 1 top variant, everyone
  // will have a chance to be displayed
  const toGrid = variant.ancestors.length === 1;

  return FS.Utility.eachFile(event, function (file) {
    let fileObj;
    fileObj = new FS.File(file);
    fileObj.metadata = {
      ownerId: userId,
      productId: productId,
      variantId: variantId,
      shopId: shopId,
      priority: count,
      toGrid: +toGrid // we need number
    };
    Media.insert(fileObj);
    return count++;
  });
}

/*
 * updateImagePriorities method
 */
function updateImagePriorities() {
  let sortedMedias = _.map($(".gallery").sortable("toArray", {
    attribute: "data-index"
  }), function (index) {
    return {
      mediaId: index
    };
  });

  let _results = [];
  for (let image of sortedMedias) {
    _results.push(Media.update(image.mediaId, {
      $set: {
        "metadata.priority": _.indexOf(sortedMedias, image)
      }
    }));
  }
  return _results;
}

/*
 *  Product Image Gallery
 */
Template.productImageGallery.helpers({
  media: function () {
    let mediaArray = [];
    let variant = selectedVariant();
    let product = selectedProduct();

    if (variant) {
      mediaArray = Media.find({
        "metadata.variantId": variant._id
      }, {
        sort: {
          "metadata.priority": 1
        }
      });
      // todo clean this:

      //if (!ReactionCore.hasAdminAccess() && mediaArray.count() < 1 && product) {
      //  mediaArray = Media.find({
      //    "metadata.variantId": variant._id/*product.variants[0]._id*/
      //  }, {
      //    sort: {
      //      "metadata.priority": 1
      //    }
      //  });
      //}
    }/* else { // TODO: is this part make sense?
      if (product) {
        let ids = [];
        for (variant of product.variants) {
          ids.push(variant._id);
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
    }*/
    return mediaArray;
  },
  variant: function () {
    return selectedVariant();
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
          if (typeof variant !== "object") {
            variant = selectedVariant();
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
      let variant = selectedVariant();

      // todo clean this:
      // todo this part is no sense anymore, because we always will have a
      // variant, right?

      //if (!variant) {
      //  let product = selectedProduct();
      //  if (product) {
      //    for (let productVariant of product.variants) {
      //      let mediaResults = Media.find({
      //        "metadata.variantId": productVariant._id
      //      }, {
      //        sort: {
      //          "metadata.priority": 1
      //        }
      //      }).fetch();
      //      // loop within product variants
      //      for (let media of mediaResults) {
      //        ids.push(media._id);
      //        if ($(event.currentTarget).data("index") === media._id) {
      //          setCurrentVariant(productVariant._id);
      //        }
      //      }
      //      if (selectedVariant()) {
      //        break;
      //      }
      //    }
      //  }
      //
      //  /*
      //  hide all images not associated with the highlighted variant
      //  to prevent the alternate variant images from being displayed.
      //   */
      //  if (ids.length > 0) {
      //    $(".gallery li").each(function (k, v) {
      //      let vId = $(v).data("index");
      //      if (_.indexOf(ids, vId) < 0) {
      //        return $(v).hide();
      //      }
      //    });
      //  }
      //}
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
