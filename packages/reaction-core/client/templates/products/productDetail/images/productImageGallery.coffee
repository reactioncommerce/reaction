Media = ReactionCore.Collections.Media

# *****************************************************
# Template.productImageGallery.helpers
# *****************************************************
Template.productImageGallery.helpers
  media: ->
    mediaArray = []
    variant = selectedVariant()
    if variant
      mediaArray = Media.find({'metadata.variantId':variant._id}, {sort: {'metadata.priority': 1}})
      if !Roles.userIsInRole(Meteor.user(), "admin") and !@isOwner and mediaArray.count() < 1
        mediaArray = Media.find({'metadata.variantId':selectedProduct().variants[0]._id}, {sort: {'metadata.priority': 1}})
    else
      # If no variant selected, get media for all product variants
      prod = selectedProduct()
      if prod
        ids = []
        for v in prod.variants
          ids.push v._id
        mediaArray = Media.find({'metadata.variantId': { $in: ids}}, {sort: {'metadata.priority': 1}})
    return mediaArray

  variant: ->
    return selectedVariant()

Template.productImageGallery.rendered = ->
  @autorun ->
    # Drag and drop image index update
    if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
      $gallery = $(".gallery")
      $gallery.sortable
        cursor: "move"
        opacity: 0.3
        placeholder: "sortable"
        forcePlaceholderSize: true
        update: (event, ui) ->
          variant = selectedVariant() unless variant?._id
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

uploadHandler = (event, template) ->
  productId = selectedProductId()
  variantId = selectedVariantId()
  userId = Meteor.userId()
  count = Media.find({'metadata.variantId': variantId }).count()
  FS.Utility.eachFile event, (file) ->
    fileObj = new FS.File(file)
    fileObj.metadata =
      ownerId: userId
      productId: productId
      variantId: variantId
      shopId: ReactionCore.getShopId()
      priority: count
    Media.insert fileObj
    count++

Template.productImageGallery.events
  "mouseenter .gallery > li": (event, template) ->
      event.stopImmediatePropagation()
      # TODO add hoverIntent to prevent swapping image on mouseout
      unless Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
        first = $('.gallery li:nth-child(1)')
        target = $(event.currentTarget)

        # Figure out the variant from the moused over image
        if false == selectedVariant()
          product = selectedProduct()
          if product
            for variant in product.variants
              ids = []  # Collect all the Variant media IDs
              for media in Media.find({'metadata.variantId':variant._id}, {sort: {'metadata.priority': 1}}).fetch()
                ids.push media._id
                if $(event.currentTarget).data('index') == media._id
                  setCurrentVariant variant._id

              # we found the selected variant, break out of the loop
              if selectedVariant()
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

  "dropped #galleryDropPane": uploadHandler

Template.imageUploader.events
  "click #btn-upload": (event,template) ->
    $("#files").click()

  "change #files": uploadHandler

  "dropped #dropzone": uploadHandler