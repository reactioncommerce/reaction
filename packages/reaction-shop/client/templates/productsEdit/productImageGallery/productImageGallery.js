// *****************************************************
// save changed image data
// *****************************************************
uploadImages = function (upload) {
  var currentProductId = Session.get('currentProductId');
  var newImages = [];

  for (var i = upload.length - 1; i >= 0; i--) {
    newImages.push({src: upload[i].url,mimeType: upload[i].mimetype});
  }

  Products.update(currentProductId, {$addToSet: {images: {$each: newImages}}}, function (error) {
    if (error) {
      throwError(error.reason);
    }
  });
};


Template.productImageGallery.gallery = function(){
    var currentProductId = Session.get('currentProductId');
    return Products.findOne(currentProductId,{$sort:{position: -1 }}).images;
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
        uploadImages(InkBlobs)
      },
      onError: function (FPError) {
        $.pnotify({title: 'Filepicker.io Error',text:FPError.toString(),type: 'error'});
      },
      onProgress: function (percentage) {
        $("#galleryDropPane").text("Uploading (" + percentage + "%)");
      }
    });
  };
  loadPicker(cb);
};

// *****************************************************
// set session image-url whenever a secondary image is clicked
// returns image url
// *****************************************************
Template.productImageGallery.events({
  'click .edit-image': function (event,template) {
    Session.set('image-url', this.src);
    $(".image-src").attr("src", this.src);
    $(".image-src").attr("data-url", this.src);
  },
    // *****************************************************
  // get session image-url and deletes from images,
  // or deletes from image if no session data
  // TODO: Consider path {path: '/myfiles/1234.png'};
  // *****************************************************
  'click .imageAddButton': function (event) {
    filepicker.pickAndStore({multiple: true}, {},
      function (InkBlob) {
        uploadImages(InkBlob);
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
  // get session image-url and deletes from images,
  // or deletes from image if no session data
  // *****************************************************
  'click .image-remove-link': function (event, template) {
    event.preventDefault();

    var currentProductId = Session.get('currentProductId');
    var sessionImage = Session.get('image-url');

    if (Session.equals("image-url", undefined)) {

        Products.update(currentProductId, {$pull: {images: this}}, function (error) {
          if (error) {
            throwError(error.reason);
          }
        });

    } else {
      Products.update(currentProductId, {$pull: {images: {src: sessionImage} } }, function (error) {
        if (error) {
          // display the error to the user
          throwError(error.reason);
        } else {
          Session.set('image-url', undefined);
        }
      });
    }
  },
});