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
                $.gritter.add({
                    // (string | mandatory) the heading of the notification
                    title: '"Filepicker.io Error"',
                    // (string | mandatory) the text inside the notification
                    text: FPError.toString()
                });
                console.log(FPError.toString());
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
    'click .edit-image': function () {
        Session.set('image-url', this.src);
        $(".image-src").attr("src", this.src);
        $(".image-src").attr("data-url", this.src);
    }
});
