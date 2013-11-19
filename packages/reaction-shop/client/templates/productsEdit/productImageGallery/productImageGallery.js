// *****************************************************
// save changed image data
// *****************************************************
uploadMedias = function (upload) {
  var currentProductId = Session.get('currentProductId');
  var newMedias = [];

  for (var i = upload.length - 1; i >= 0; i--) {
    newMedias.push({src: upload[i].url,mimeType: upload[i].mimetype});
  }

  Products.update(currentProductId, {$addToSet: {medias: {$each: newMedias}}}, function (error) {
    if (error) {
      throwError(error.reason);
    }
  });
};

Template.productImageGallery.firstImage = function() {
  var imageUrl = Session.get('media-url');
  if (imageUrl) {
    return _.find(this, function (media) {
      return media.src === imageUrl;
    });
  } else {
    return _.find(this, function (media) {
      mimetype = typeof media.mimeType !== 'undefined' ? media.mimeType : "image";
      return mimetype.match('image.*')
    });
  }
};

Template.productImageGallery.helpers({
  // *****************************************************
  // simple helper to determine if the stored image data is a video
  // returns boolean
  // *****************************************************
  isimage: function (mimetype, options) {
    mimetype = typeof mimetype !== 'undefined' ? mimetype : "image";
    if (mimetype.match('image.*')) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  },
  isvideo: function (mimetype, options) {
    mimetype = typeof mimetype !== 'undefined' ? mimetype : "image";
    if (mimetype.match('video.*')) {
      return options.fn(this);
    } else {

      return options.inverse(this);
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
        // console.log('thisEnter target: ' + this.event.target);
        galleryDropPane.addClass("drag-over");
      },
      dragLeave: function (event) {
        if (lastenter === this.event.target) {
          // console.log('thisLeav target: ' + this.event.target);
          galleryDropPane.removeClass("drag-over");
        }
      },
      onSuccess: function (InkBlobs) {
        uploadMedias(InkBlobs)
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

  var $productMedias = $('.product-medias');
  $productMedias.sortable({
    items: "> li.sortable",
    cursor: 'move',
    opacity: 0.3,
    helper: 'clone',
    placeholder: 'sortable-placeholder', // <li class="sortable-placeholder"></li>
    forcePlaceholderSize: true,
    update: function (event, $ui) {
      $productMedias.removeClass('is-sorting');
      var sortedMedias = _.map($productMedias.sortable('toArray', {'attribute': 'data-index'}), function (index) {
        return product.medias[index];
      });
      Products.update(product._id, {$set: {medias: sortedMedias}});
    },
    start: function (event, $ui) {
      $ui.placeholder.height($ui.helper.height() - 4);
      $ui.placeholder.html('Drop image to reorder');
      $ui.placeholder.css('padding-top', $ui.helper.height() / 2 - 18);
      $productMedias.addClass('is-sorting');
    },
    stop: function(event, $ui) {
      return $productMedias.removeClass('is-sorting');
    }
  });
};

// *****************************************************
// set session media-url whenever a secondary image is clicked
// returns image url
// *****************************************************
Template.productImageGallery.events({
  'click .edit-image': function (event, template) {
    Session.set('media-url', this.src);
  },
    // *****************************************************
  // get session media-url and deletes from images,
  // or deletes from image if no session data
  // TODO: Consider path {path: '/myfiles/1234.png'};
  // *****************************************************
  'click .imageAddButton': function (event) {
    filepicker.pickAndStore({multiple: true}, {},
      function (InkBlob) {
        uploadMedias(InkBlob);
      },
      function (FPError) {
        if (FPError.code == 101) {
          return; // The user closed the picker without choosing a file
        }
        $.pnotify({title: 'Filepicker.io Error',text:FPError.toString(),type: 'error'});
      }

    );

  },

  // *****************************************************
  // get session media-url and deletes from images,
  // or deletes from image if no session data
  // *****************************************************
  'click .image-remove-link': function (event, template) {
    event.preventDefault();

    var currentProductId = Session.get('currentProductId');
    var sessionMedia = Session.get('media-url');

    if (Session.equals("media-url", undefined)) {

        Products.update(currentProductId, {$pull: {medias: this}}, function (error) {
          if (error) {
            throwError(error.reason);
          }
        });

    } else {
      Products.update(currentProductId, {$pull: {medias: {src: sessionMedia} } }, function (error) {
        if (error) {
          // display the error to the user
          throwError(error.reason);
        } else {
          Session.set('media-url', undefined);
        }
      });
    }
  },
});
