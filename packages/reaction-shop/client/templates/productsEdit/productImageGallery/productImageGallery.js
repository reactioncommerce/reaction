Template.productImageGallery.helpers({
  // *****************************************************
  // simple helper to determine if the stored image data is a video
  // returns boolean
  // *****************************************************
  isimage: function (mimetype, options) {
    mimetype = typeof mimetype !== 'undefined' ? mimetype : "image";
    if (mimetype.match('image.*')) {
      return options.inverse(this);
      //return options.fn(this);
    } else {
      return options.fn(this);
      //return options.inverse(this);
    }
  }
});

Template.productImageGallery.rendered = function () {
  var product = this.data;
  // *****************************************************
  // Filepicker.io image upload
  // https://developers.inkfilepicker.com/docs/
  // requires apikey
  // *****************************************************
  var cb = function () {
    // Drag and Drop zone
    var galleryDropPane = $('#galleryDropPane'),
      lastenter;

    filepicker.makeDropPane($('#galleryDropPane')[0], {
      multiple: true,
      dragEnter: function (event) {
        lastenter = this.event.target;
        galleryDropPane.addClass("drag-over");
      },
      dragLeave: function (event) {
        if (lastenter === this.event.target) {
          console.log('thistarget' + this.target);
          galleryDropPane.removeClass("drag-over");
        }
      },
      onSuccess: function (InkBlobs) {
        uploadImages(InkBlobs)
      },
      onError: function (FPError) {
        $.pnotify({title: 'Filepicker.io Error', text: FPError.toString(), type: 'error'});
      },
      onProgress: function (percentage) {
        $("#galleryDropPane").text("Uploading (" + percentage + "%)");
      }
    });
  };
  loadPicker(cb);

  var $productImages = $('.product-images');
  $productImages.sortable({
    cursor: 'move',
    opacity: 0.3,
    helper: 'clone',
    placeholder: 'sortable-placeholder', // <li class="sortable-placeholder"></li>
    forcePlaceholderSize: true,
    update: function (event, $ui) {
      $productImages.removeClass('is-sorting');
      var sortedImages = _.map($productImages.sortable('toArray', {'attribute': 'data-index'}), function (index) {
        return product.images[index];
      });
      Products.update(product._id, {$set: {images: sortedImages}});
    },
    start: function (event, $ui) {
      $ui.placeholder.height($ui.helper.height() - 4);
      $ui.placeholder.html('Drop image to reorder');
      $ui.placeholder.css('padding-top', $ui.helper.height() / 2 - 18);
      $productImages.addClass('is-sorting');
    },
    stop: function(event, $ui) {
      return $productImages.removeClass('is-sorting');
    }
  });
};

// *****************************************************
// set session image-url whenever a secondary image is clicked
// returns image url
// *****************************************************
Template.productImageGallery.events({
  'click .edit-image': function () {
    Session.set('image-url', this.src);
    $(".image-src").attr("src", this.src);
    $(".image-src").attr("data-url", this.src);
  }
});
