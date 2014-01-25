# *****************************************************
# Template.productImageGallery.helpers
# *****************************************************
Template.productImageGallery.helpers
  variant: ->
    (currentProduct.get "variant")

  isimage: (mimetype, options) ->
    mimetype = (if typeof mimetype != "undefined" then mimetype else "image")
    if mimetype.match("image.*")
      options.inverse this
    else
      options.fn this

  isvideo: (mimetype, options) ->
    mimetype = (if typeof mimetype != "undefined" then mimetype else "image")
    if mimetype.match("video.*")
      options.fn this
    else
      options.inverse this

# *****************************************************
# Template.productImageGallery.rendered
# *****************************************************
Template.productImageGallery.rendered = ->
  # *****************************************************
  # Filepicker.io image upload
  # https://developers.inkfilepicker.com/docs/
  # requires apikey
  # *****************************************************
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
          throwAlert(FPError.toString(),"Filepicker.io Error","error")
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
        $set["variants."+(currentProduct.get "index")+".medias"] = sortedMedias
        Products.update((currentProduct.get "product")._id, {$set: $set})
      start: (event, $ui) ->
        $ui.placeholder.height $ui.helper.height()
        $ui.placeholder.html "Drop image to reorder"
        $ui.placeholder.css "padding-top", $ui.helper.height() / 3
        $ui.placeholder.css "border", "1px dashed #ccc"
        $ui.placeholder.css "border-radius","6px"


# *****************************************************
# set primaryImage whenever a secondary image == clicked
# returns image url
# *****************************************************
Template.productImageGallery.events
  "click .view-image": (event, template) ->
    #Template.productImageGallery._tmpl_data.helpers.primaryImage @src
    $('#main-image').attr('src', @src )


# *****************************************************
# manual image upload
# *****************************************************
  "click .imageAddButton": (event) ->
    filepicker.pickAndStore
      multiple: true
    , {}, ((InkBlob) ->
      uploadMedias InkBlob
    ), (FPError) ->
      return  if FPError.code == 101 # The user closed the picker without choosing a file
      throwAlert FPError.toString(),"Filepicker.io Error"


# *****************************************************
# delete image based on selected src of primary image
# *****************************************************
  "click .image-remove-link": (event, template) ->
    event.preventDefault()
    mediaUrl = $('#main-image').attr("src")
    media = _.find (currentProduct.get "variant").medias, (media) ->
      media.src == mediaUrl
    $pull = {}
    $pull["variants."+(currentProduct.get "index")+".medias"] = media
    Products.update (currentProduct.get "product")._id, {$pull: $pull}, (error) ->
      if error
        throwAlert error.reason

# *****************************************************
# save changed image data
# *****************************************************
uploadMedias = (upload) ->
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
  $addToSet["variants."+(currentProduct.get "index")+".medias"] =
    $each: newMedias
  Products.update (currentProduct.get "product")._id, {$addToSet: $addToSet}, (error) ->
    throwAlert error if error

