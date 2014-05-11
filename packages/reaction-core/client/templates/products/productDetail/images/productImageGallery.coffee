# *****************************************************
# Template.productImageGallery.helpers
# *****************************************************
Template.productImageGallery.helpers
  media: ->
    mediaArray = []
    variant = (currentProduct.get "variant")
    if variant?
      mediaArray = Media.find({'metadata.variantId':variant._id}, {sort: {'metadata.priority': 1}})
      # If no media is found for this variant, get the first variant's primary image
      if !Roles.userIsInRole(Meteor.user(), "admin") and !@isOwner and mediaArray.count() < 1
        mediaArray = Media.find({'metadata.variantId':currentProduct.get("product").variants[0]._id}, {sort: {'metadata.priority': 1}})
      mediaArray

  variant: ->
    (currentProduct.get "variant")

Template.productImageGallery.rendered = ->
    # Drag and drop image index update
    if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
      $gallery = $(".gallery")
      $gallery.sortable
        cursor: "move"
        opacity: 0.3
        placeholder: "sortable"
        forcePlaceholderSize: true
        update: (event, ui) ->
          variant = (currentProduct.get "variant") unless variant?._id
          variant.medias = new Array
          #get changed order
          sortedMedias = _.map($gallery.sortable("toArray",
            attribute: "data-index"
          ), (index) ->
             {"mediaId":index}
          )

          for image,value in sortedMedias
            console.log image
            Media.update(image.mediaId, {$set: {'metadata.priority': value}})

        start: (event, ui) ->
          ui.placeholder.html "Drop image to reorder"
          ui.placeholder.css "padding-top", "30px"
          ui.placeholder.css "border", "1px dashed #ccc"
          ui.placeholder.css "border-radius","6px"
     else
       # use the first image as the main image after page load
       _.defer ->
         $('.mainImg').attr('src', $("li:nth-child(1) img").attr("src"))

Template.productImageGallery.events

  "mouseover .gallery > li > img": (event, template) ->
      event.stopImmediatePropagation()
      unless Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
        main = $('.mainImg')
        main.fadeOut 400, ->
          main.attr('src', $(event.currentTarget).attr('src')).load ->
              main.fadeIn 200

  "click .remove-image": (event, template) ->
    @remove()
    return
  "dropped #galleryDropPane": (event, template) ->
    FS.Utility.eachFile event, (file) ->
      fileObj = new FS.File(file)
      fileObj.metadata =
        ownerId: Meteor.userId()
        productId: currentProduct._id
        variantId: (currentProduct.get "variant")._id unless variant?._id
        shopId: Meteor.app.shopId
      Media.insert fileObj

Template.imageUploader.events
  "click #btn-upload": (event,template) ->
    $("#files").click()

  "change #files": (event, template) ->
    FS.Utility.eachFile event, (file) ->
      fileObj = new FS.File(file)
      fileObj.metadata =
        ownerId: Meteor.userId()
        productId: currentProduct._id
        variantId: (currentProduct.get "variant")._id unless variant?._id
        shopId: Meteor.app.shopId
      Media.insert fileObj
      return
    return

  "dropped #dropzone": (event, template) ->
    FS.Utility.eachFile event, (file) ->
      fileObj = new FS.File(file)
      fileObj.metadata =
        ownerId: Meteor.userId()
        productId: currentProduct._id
        variantId: (currentProduct.get "variant")._id unless variant?._id
        shopId: Meteor.app.shopId
      Media.insert fileObj
      return
    return

