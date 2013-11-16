Template.productImage.rendered = function () {
  // *****************************************************
  // Filepicker.io image upload
  // https://developers.inkfilepicker.com/docs/
  // requires apikey
  // *****************************************************
  var cb = function () {
    // Drag and Drop zone
    var imageDropPane = $('#imageDropPane'),
      lastenter;

    filepicker.makeDropPane(imageDropPane[0], {
      multiple: true,
      dragEnter: function (event) {
        lastenter = this.event.target;
        imageDropPane.addClass("drag-over");
      },
      dragLeave: function (event) {
        if (lastenter === this.event.target) {
          imageDropPane.removeClass("drag-over");
        }
      },
      onSuccess: function (InkBlobs) {
        uploadImages(InkBlobs)
      },
      onError: function (FPError) {
        $.pnotify({title: 'Filepicker.io Error',text:FPError.toString(),type: 'error'});
      },
      onProgress: function (percentage) {
        imageDropPane.text("Uploading (" + percentage + "%)");
      }
    });
  };
  loadPicker(cb);
};