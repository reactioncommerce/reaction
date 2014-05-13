# *****************************************************
# Template.productImageGallery.helpers
# *****************************************************
Template.productImageGallery.helpers
  media: ->
    mediaArray = []
    variant = (currentProduct.get "variant")
    if variant?
      Media.find({'metadata.variantId':variant._id}, {sort: {'metadata.priority': 1}})
      # If no media is found for this variant, get the first variant's primary image
      #if !Roles.userIsInRole(Meteor.user(), "admin") and !@isOwner and mediaArray.count() < 1
          #mediaArray = Media.find({'metadata.variantId':currentProduct.get("product").variants[0]._id}, {sort: {'metadata.priority': 1}})
      #mediaArray

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
            Media.update(image.mediaId, {$set: {'metadata.priority': value}})

        start: (event, ui) ->
          ui.placeholder.html "Drop image to reorder"
          ui.placeholder.css "padding-top", "30px"
          ui.placeholder.css "border", "1px dashed #ccc"
          ui.placeholder.css "border-radius","6px"

Template.productImageGallery.events

  "mouseenter .gallery > li": (event, template) ->
      event.stopImmediatePropagation()
      # TODO add hoverIntent to prevent swapping image on mouseout
      unless Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
        if $(event.currentTarget).find('img').data('index') != $('.gallery li:nth-child(1) img').data('index')
          t = $('.gallery li:nth-child(1)')
          $('.gallery li:nth-child(1)').fadeOut 400, ->
            $(this).replaceWith($(event.currentTarget))
            t.css({'display':'inline-block'}).appendTo($('.gallery'))
            $('.gallery li:last-child').fadeIn 100

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

