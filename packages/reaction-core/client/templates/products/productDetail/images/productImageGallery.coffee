# *****************************************************
# Template.productImageGallery.helpers
# *****************************************************
Template.productImageGallery.helpers
  media: ->
    mediaArray = []
    variant = (currentProduct.get "variant")
    if variant?
      Media.find({'metadata.variantId':variant._id})

  variant: ->
    (currentProduct.get "variant")

Template.productImageGallery.rendered = ->
    # Drag and drop image index update
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
  "click .remove-image": (event, template) ->
    @remove()
    return


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
        shopId: Meteor.app.getCurrentShop(this)._id
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
        shopId: Meteor.app.getCurrentShop(this)._id
      Media.insert fileObj
      return
    return

