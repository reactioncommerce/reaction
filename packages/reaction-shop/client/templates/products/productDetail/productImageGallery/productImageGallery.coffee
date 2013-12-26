Template.productImageGallery.variant = ->
  getSelectedVariant()

Template.productImageGallery.firstImage = ->
  imageUrl = Session.get("media-url")
  if imageUrl
    _.find this, (media) ->
      media.src == imageUrl
  else
    _.find this, (media) ->
      mimetype = (if typeof media.mimeType != "undefined" then media.mimeType else "image")
      mimetype.match "image.*"


Template.productImageGallery.isimage = (mimetype, options) ->
  mimetype = (if typeof mimetype != "undefined" then mimetype else "image")
  if mimetype.match("image.*")
    options.inverse this
  else
    options.fn this

Template.productImageGallery.isvideo = (mimetype, options) ->
  mimetype = (if typeof mimetype != "undefined" then mimetype else "image")
  if mimetype.match("video.*")
    options.fn this
  else
    options.inverse this

Template.productImageGallery.rendered = ->
  product = @data
  variant = getSelectedVariant()

  # *****************************************************
  # Filepicker.io image upload
  # https://developers.inkfilepicker.com/docs/
  # requires apikey
  # *****************************************************

  # unless Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
  #   new Packery(document.querySelector(".gallery"), {gutter: 2,"itemSelector": "li", "stamp": ".product-image"})

  if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
    $('#galleryDropPane').css "border", "1px dashed #ccc"
    cb = ->
      # Drag and drop image upload
      galleryDropPane = $("#galleryDropPane")
      lastenter = undefined
      filepicker.makeDropPane $("#galleryDropPane")[0],
        multiple: true
        dragEnter: (event) ->
          lastenter = this.event.target
          $('#galleryDropPane').css "background-color", "#b6d3de"
        dragLeave: (event) ->
          galleryDropPane.css "background-color", "#F6F6F6"  if lastenter == this.event.target
        onSuccess: (InkBlobs) ->
          uploadMedias InkBlobs
        onError: (FPError) ->
          throwError(FPError.toString(),"Filepicker.io Error","error")
        onProgress: (percentage) ->
          $("#galleryDropPane").text "Uploading (" + percentage + "%)"
    window.loadPicker cb
    # Drag and drop image index update
    $gallery = $(".gallery")
    $gallery.sortable
      items: "> li.sortable"
      cursor: "move"
      opacity: 0.3
      helper: "clone"
      placeholder: "sortable"
      forcePlaceholderSize: true
      update: (event, ui) ->
        sortedMedias = _.map($gallery.sortable("toArray",
          attribute: "data-index"
        ), (index) ->
          variant.medias[index]
        )
        $set = {}
        $set["variants."+getSelectedVariantIndex()+".medias"] = sortedMedias
        Products.update(product._id, {$set: $set})
      start: (event, $ui) ->
        $ui.placeholder.height $ui.helper.height()
        $ui.placeholder.html "Drop image to reorder"
        $ui.placeholder.css "padding-top", $ui.helper.height() / 3
        $ui.placeholder.css "border", "1px dashed #ccc"
        $ui.placeholder.css "border-radius","6px"


# *****************************************************
# set session media-url whenever a secondary image == clicked
# returns image url
# *****************************************************
Template.productImageGallery.events
  "click .view-image": (event, template) ->
    Session.set "media-url", @src


# *****************************************************
# get session media-url and deletes from images,
# or deletes from image if no session data
# TODO: Consider path {path: '/myfiles/1234.png'};
# *****************************************************
  "click .imageAddButton": (event) ->
    filepicker.pickAndStore
      multiple: true
    , {}, ((InkBlob) ->
      uploadMedias InkBlob
    ), (FPError) ->
      return  if FPError.code == 101 # The user closed the picker without choosing a file
      throwError FPError.toString(),"Filepicker.io Error"


# *****************************************************
# get session media-url and deletes from images,
# or deletes from image if no session data
# *****************************************************
  "click .image-remove-link": (event, template) ->
    event.preventDefault()
    currentProductId = Session.get("currentProductId")
    mediaUrl = Session.get("media-url") || $(event.target).closest(".gallery-tools").prevAll(".product-image").find("img").attr("src")
    media = _.find getSelectedVariant().medias, (media) ->
      media.src == mediaUrl
    $pull = {}
    $pull["variants."+getSelectedVariantIndex()+".medias"] = media
    Products.update currentProductId, {$pull: $pull}, (error) ->
      if error
        throwError error.reason
      else
        Session.set "media-url", `undefined`

# *****************************************************
# save changed image data
# *****************************************************
uploadMedias = (upload) ->
  currentProductId = Session.get("currentProductId")
  newMedias = []
  i = upload.length - 1
  while i >= 0
    newMedias.push
      src: upload[i].url
      mimeType: upload[i].mimetype
      updatedAt: new Date()
      createdAt: new Date()
    i--
  $addToSet = {}
  $addToSet["variants."+getSelectedVariantIndex()+".medias"] =
    $each: newMedias
  Products.update currentProductId, {$addToSet: $addToSet}, (error) ->
    throwError error if error

