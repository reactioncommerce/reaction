# *****************************************************
# Template.productImageGallery.helpers
# *****************************************************
Template.productImageGallery.helpers
  media: ->
    mediaArray = []
    variant = (currentProduct.get "variant")
    if variant
      mediaArray = Media.find({'metadata.variantId':variant._id}, {sort: {'metadata.priority': 1}})
      if !Roles.userIsInRole(Meteor.user(), "admin") and !@isOwner and mediaArray.count() < 1
        mediaArray = Media.find({'metadata.variantId':currentProduct.get("product").variants[0]._id}, {sort: {'metadata.priority': 1}})
    else
      # If no variant selected, get media for all product variants
      if currentProduct.get("product")?
        ids = []
        for v in currentProduct.get('product').variants
          ids.push v._id
        mediaArray = Media.find({'metadata.variantId': { $in: ids}}, {sort: {'metadata.priority': 1}})
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
        first = $('.gallery li:nth-child(1)')
        target = $(event.currentTarget)

        # Figure out the variant from the moused over image
        if false == (currentProduct.get "variant")
          if currentProduct.get("product")?
            for variant in currentProduct.get('product').variants
              ids = []  # Collect all the Variant media IDs
              for media in Media.find({'metadata.variantId':variant._id}, {sort: {'metadata.priority': 1}}).fetch()
                ids.push media._id
                if $(event.currentTarget).data('index') == media._id
                  currentProduct.set "variant", variant

              # we found the selected variant, break out of the loop
              if (currentProduct.get "variant")
                break

          ###
          hide all images not associated with the highlighted variant
          to prevent the alternate variant images from being displayed.
          ###
          if ids.length > 0
            $('.gallery li').each (k,v) ->
              $(v).hide() unless $(v).data("index") in ids

        if $(target).data('index') != first.data('index')
          $('.gallery li:nth-child(1)').fadeOut 400, ->
            $(this).replaceWith(target)
            first.css({'display':'inline-block'}).appendTo($('.gallery'))
            $('.gallery li:last-child').fadeIn 100

  "click .remove-image": (event, template) ->
    @remove()
    return

  "dropped #galleryDropPane": (event, template) ->
    variantId = (currentProduct.get "variant")._id unless variant?._id
    count = Media.find({'metadata.variantId': variantId }).count()
    FS.Utility.eachFile event, (file, count, variantId) ->
      fileObj = new FS.File(file)
      fileObj.metadata =
        ownerId: Meteor.userId()
        productId: currentProduct._id
        variantId: (currentProduct.get "variant")._id unless variant?._id
        shopId: Meteor.app.shopId
        priority: count
      Media.insert fileObj
      count++

Template.imageUploader.events
  "click #btn-upload": (event,template) ->
    $("#files").click()

  "change #files": (event, template) ->
    variantId = (currentProduct.get "variant")._id unless variant?._id
    count = Media.find({'metadata.variantId': variantId }).count()
    FS.Utility.eachFile event, (file, count, variantId) ->
      fileObj = new FS.File(file)
      fileObj.metadata =
        ownerId: Meteor.userId()
        productId: currentProduct._id
        variantId: (currentProduct.get "variant")._id unless variant?._id
        shopId: Meteor.app.shopId
        priority: count
      Media.insert fileObj
      count++

  "dropped #dropzone": (event, template) ->
    variantId = (currentProduct.get "variant")._id unless variant?._id
    count = Media.find({'metadata.variantId': variantId }).count()
    FS.Utility.eachFile event, (file, count, variantId) ->
      fileObj = new FS.File(file)
      fileObj.metadata =
        ownerId: Meteor.userId()
        productId: currentProduct._id
        variantId: (currentProduct.get "variant")._id unless variant?._id
        shopId: Meteor.app.shopId
        priority: count
      Media.insert fileObj
      count++