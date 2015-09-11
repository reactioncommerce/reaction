/**
* productImageGallery helpers
*/
var Media, updateImagePriorities, uploadHandler,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Media = ReactionCore.Collections.Media;

Template.productImageGallery.helpers({
  media: function() {
    var ids, mediaArray, prod, v, variant, _i, _len, _ref;
    mediaArray = [];
    variant = selectedVariant();
    if (variant) {
      mediaArray = Media.find({
        'metadata.variantId': variant._id
      }, {
        sort: {
          'metadata.priority': 1
        }
      });
      if (!ReactionCore.hasAdminAccess() && mediaArray.count() < 1) {
        mediaArray = Media.find({
          'metadata.variantId': selectedProduct().variants[0]._id
        }, {
          sort: {
            'metadata.priority': 1
          }
        });
      }
    } else {
      prod = selectedProduct();
      if (prod) {
        ids = [];
        _ref = prod.variants;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          ids.push(v._id);
        }
        mediaArray = Media.find({
          'metadata.variantId': {
            $in: ids
          }
        }, {
          sort: {
            'metadata.priority': 1
          }
        });
      }
    }
    return mediaArray;
  },
  variant: function() {
    return selectedVariant();
  }
});

/**
* productImageGallery onRendered
*/

Template.productImageGallery.onRendered(function() {
  return this.autorun(function() {
    var $gallery;
    if (ReactionCore.hasAdminAccess()) {
      $gallery = $(".gallery");
      return $gallery.sortable({
        cursor: "move",
        opacity: 0.3,
        placeholder: "sortable",
        forcePlaceholderSize: true,
        update: function(event, ui) {
          var variant;
          if (!(typeof variant !== "undefined" && variant !== null ? variant._id : void 0)) {
            variant = selectedVariant();
          }
          variant.medias = new Array;
          return updateImagePriorities();
        },
        start: function(event, ui) {
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
* uploadHandler method
*/

uploadHandler = function(event, template) {
  var count, productId, shopId, userId, variantId;
  productId = selectedProductId();
  variantId = selectedVariantId();
  shopId = selectedProduct().shopId || ReactionCore.getShopId();
  userId = Meteor.userId();
  count = Media.find({
    'metadata.variantId': variantId
  }).count();
  return FS.Utility.eachFile(event, function(file) {
    var fileObj;
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
};

/**
* productImageGallery events
*/

Template.productImageGallery.events({
  "mouseenter .gallery > li": function(event, template) {
    var first, ids, media, product, target, variant, _i, _j, _len, _len1, _ref, _ref1;
    event.stopImmediatePropagation();
    if (!ReactionCore.hasPermission('createProduct')) {
      first = $('.gallery li:nth-child(1)');
      target = $(event.currentTarget);
      if (false === selectedVariant()) {
        product = selectedProduct();
        if (product) {
          _ref = product.variants;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            variant = _ref[_i];
            ids = [];
            _ref1 = Media.find({
              'metadata.variantId': variant._id
            }, {
              sort: {
                'metadata.priority': 1
              }
            }).fetch();
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              media = _ref1[_j];
              ids.push(media._id);
              if ($(event.currentTarget).data('index') === media._id) {
                setCurrentVariant(variant._id);
              }
            }
            if (selectedVariant()) {
              break;
            }
          }
        }

        /*
        hide all images not associated with the highlighted variant
        to prevent the alternate variant images from being displayed.
         */
        if (ids.length > 0) {
          $('.gallery li').each(function(k, v) {
            var _ref2;
            if (_ref2 = $(v).data("index"), __indexOf.call(ids, _ref2) < 0) {
              return $(v).hide();
            }
          });
        }
      }
      if ($(target).data('index') !== first.data('index')) {
        return $('.gallery li:nth-child(1)').fadeOut(400, function() {
          $(this).replaceWith(target);
          first.css({
            'display': 'inline-block'
          }).appendTo($('.gallery'));
          return $('.gallery li:last-child').fadeIn(100);
        });
      }
    }
  },
  "click .remove-image": function(event, template) {
    this.remove();
    updateImagePriorities();
  },
  "dropped #galleryDropPane": uploadHandler
});

/**
* updateImagePriorities method
*/

updateImagePriorities = function() {
  var image, sortedMedias, value, _i, _len, _results;
  sortedMedias = _.map($('.gallery').sortable("toArray", {
    attribute: "data-index"
  }), function(index) {
    return {
      "mediaId": index
    };
  });
  _results = [];
  for (value = _i = 0, _len = sortedMedias.length; _i < _len; value = ++_i) {
    image = sortedMedias[value];
    _results.push(Media.update(image.mediaId, {
      $set: {
        'metadata.priority': value
      }
    }));
  }
  return _results;
};

/**
* imageUploader events
*/

Template.imageUploader.events({
  "click #btn-upload": function(event, template) {
    return $("#files").click();
  },
  "change #files": uploadHandler,
  "dropped #dropzone": uploadHandler
});

/**
* productImageGallery events
*/

Template.productImageGallery.events({
  "click #img-upload": function(event, template) {
    return $("#files").click();
  },
  'load .img-responsive': function(event, template) {
    return Session.set('variantImgSrc', template.$('.img-responsive').attr('src'));
  }
});
