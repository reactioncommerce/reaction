import { $ } from "meteor/jquery";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Media } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

// load modules
require("jquery-ui");
/**
 * productImageGallery helpers
 */

/**
 * uploadHandler method
 */
function uploadHandler(event) {
  // TODO: It would be cool to move this logic to common ValidatedMethod, but
  // I can't find a way to do this, because of browser's `FileList` collection
  // and it `Blob`s which is our event.target.files.
  // There is a way to do this: http://stackoverflow.com/a/24003932. but it's too
  // tricky
  let productId = ReactionProduct.selectedProductId();
  const variant = ReactionProduct.selectedVariant();
  if (typeof variant !== "object") {
    return Alerts.add("Please, create new Variant first.", "danger", {
      autoHide: true
    });
  }
  const variantId = variant._id;
  let shopId = ReactionProduct.selectedProduct().shopId || Reaction.getShopId();
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
  sortedMedias.forEach((image, index) => {
    results.push(Media.update(image.mediaId, {
      $set: {
        "metadata.priority": index
      }
    }));
  });

  return results;
}

/**
 *  Product Image Gallery
 */

Template.productImageGallery.helpers({
  media: function () {
    let mediaArray = [];
    let variant = ReactionProduct.selectedVariant();

    if (variant) {
      mediaArray = Media.find({
        "metadata.variantId": variant._id
      }, {
        sort: {
          "metadata.priority": 1
        }
      });
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
    if (Reaction.hasAdminAccess()) {
      $gallery = $(".gallery");
      return $gallery.sortable({
        cursor: "move",
        opacity: 0.3,
        placeholder: "sortable",
        forcePlaceholderSize: true,
        update: function () {
          let variant;
          if (typeof variant !== "object") {
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
    event.stopImmediatePropagation();
    // This is a workaround for an issue with FF refiring mouseover when the contents change
    if (event.relatedTarget === null) {
      return undefined;
    }
    if (!Reaction.hasPermission("createProduct")) {
      let first = $(".gallery li:nth-child(1)");
      let target = $(event.currentTarget);
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
    return undefined;
  },
  "click .remove-image": function () {
    const imageUrl =
      $(event.target)
      .closest(".gallery-image")
      .find("img")
      .attr("src");

    Alerts.alert({
      title: "Remove Media?",
      type: "warning",
      showCancelButton: true,
      imageUrl,
      imageHeight: 150
    }, (isConfirm) => {
      if (isConfirm) {
        const mediaId = this._id;

        Media.remove({ _id: mediaId }, (error) => {
          if (error) {
            Alerts.toast(error.reason, "warning", {
              autoHide: 10000
            });
          }

          updateImagePriorities();
        });
      }
    });
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
