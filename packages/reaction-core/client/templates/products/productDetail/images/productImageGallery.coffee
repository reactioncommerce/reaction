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
          Alerts.add "Filepicker.io Error" +FPError.toString(), "danger"
        onProgress: (percentage) ->
          $("#galleryDropPane").text "Uploading (" + percentage + "%)"
    window.loadPicker cb
    # Drag and drop image index update
    $gallery = $(".gallery")
    $gallery.sortable
      items: "> li.gallery-sortable"
      cursor: "move"
      opacity: 0.3
      helper: "clone"
      placeholder: "sortable"
      forcePlaceholderSize: true
      update: (event, ui) ->
        variant = (currentProduct.get "variant") unless variant?._id
        #get changed order
        sortedMedias = _.map($gallery.sortable("toArray",
          attribute: "data-index"
        ), (index) ->
          variant.medias[index]
        )
        variant.medias = sortedMedias
        Meteor.call "updateVariant",variant

      start: (event, ui) ->
        ui.placeholder.height ui.helper.height()
        ui.placeholder.html "Drop image to reorder"
        ui.placeholder.css "padding-top", ui.helper.height() / 3
        ui.placeholder.css "border", "1px dashed #ccc"
        ui.placeholder.css "border-radius","6px"


# *****************************************************
# set primaryImage whenever a secondary image == clicked
# returns image url
# *****************************************************
Template.productImageGallery.events
  "mouseover .view-image": (event, template) ->
    unless Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
      source = @src
      unless source is $("#main-image").attr("src")
        $(".view-image").removeClass("product-image-selected")
        $(event.currentTarget).addClass("product-image-selected")
        $("#main-image").fadeOut 400, ->
          $(this).attr("src", source).bind "onreadystatechange load", ->
            $(this).fadeIn 300 if @complete
            return
          return

  "click .view-image": (event, template) ->
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
      Alerts.add "Filepicker.io Error" +FPError.toString(), "danger"


# *****************************************************
# delete image based on selected src of primary image
# *****************************************************
  "click .image-remove-link": (event, template) ->
    mediaUrl = $('#main-image').attr("src")
    # get and remove from template data
    variant = (currentProduct.get "variant")
    for media,index in variant
      if media.src is mediaUrl
        removeIndex = index
    variant.medias.splice(removeIndex,1)
    Meteor.call "updateVariant",variant

    event.preventDefault()
    event.stopPropagation()


# *****************************************************
# save changed image data
# *****************************************************
uploadMedias = (upload) ->
  variant = (currentProduct.get "variant") unless variant?._id
  variant.medias = new Array unless variant.medias
  i = upload.length - 1
  while i >= 0
    variant.medias.push
      src: upload[i].url
      mimeType: upload[i].mimetype
      updatedAt: new Date()
      createdAt: new Date()
    i--
  Meteor.call "updateVariant", variant

