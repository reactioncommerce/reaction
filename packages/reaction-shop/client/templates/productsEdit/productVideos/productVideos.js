// *****************************************************
// simple helper to determin if the stored image data is a video
// returns boolean
// *****************************************************
Template.productVideos.helpers({
  isvideo: function (mimetype, options) {
    mimetype = typeof mimetype !== 'undefined' ? mimetype : "image";
    if (mimetype.match('video.*')) {
      return options.fn(this);
    } else {

      return options.inverse(this);
    }
  }
});

Template.productVideos.rendered = function () {
  // *****************************************************
  // Filepicker.io image upload
  // https://developers.inkfilepicker.com/docs/
  // requires apikey
  // *****************************************************
  var cb = function () {
    // Drag and Drop zone
    var videoDropPane = $('#videoDropPane'),
      lastenter;

    filepicker.makeDropPane($('#videoDropPane')[0], {
      multiple: true,
      dragEnter: function (event) {
        lastenter = this.event.target;
        videoDropPane.addClass("drag-over");
      },
      dragLeave: function (event) {
        if (lastenter === this.event.target) {
          console.log('thisVideoDropPane' + this.event.target);
          videoDropPane.removeClass("drag-over");
        }
      },
      onSuccess: function (InkBlobs) {
        uploadImages(InkBlobs)
      },
      onError: function (FPError) {
        $.pnotify({title: 'Filepicker.io Error',text:FPError.toString(),type: 'error'});
      },
      onProgress: function (percentage) {
        $("#videoDropPane").text("Uploading (" + percentage + "%)");
      }
    });
  };
  loadPicker(cb);
};
