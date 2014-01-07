Template.productDetail.helpers
  tags: ->
    currentProductId = Session.get("currentProductId")
    product = Products.findOne(currentProductId)
    if product.tagIds
      Tags.find({_id: {$in: product.tagIds}}).fetch()
    else
      []
  stringify: (tags) ->
    _.pluck(tags, "name").join(", ")

Template.productDetail.rendered = ->
  # *****************************************************
  # function that stores images that have successfully
  # uploaded to filepicker.io
  # *****************************************************

  # *****************************************************
  # Inline field editing, handling
  # http://vitalets.github.io/x-editable/docs.html
  #
  # You could just do:  $('#username').editable();
  # but we want to maintain reactivity etc.
  # *****************************************************
  #
  if Meteor.app.hasOwnerAccess()
    $.fn.editable.defaults.mode = "inline"
    $.fn.editable.defaults.showbuttons = false

    # *****************************************************
    # TODO: Tabbing
    # SEE: https://github.com/vitalets/x-editable/issues/324
    # *****************************************************

    # *****************************************************
    # Editable product title entry
    # *****************************************************

    $("#title").editable
      type: "text"
      title: "Product name"
      clear: true
      onblur: "submit"
      emptytext: "product name goes here"
      inputclass: "pdp-title"
      success: (response, newValue) ->
        updateProduct title: newValue

      validate: (value) ->
        if $.trim(value) is ""
          throwError "This field is required"
          false
    # *****************************************************
    # Editable page title entry
    # *****************************************************
    $("#pageTitle").editable
      inputclass: "pdp-page-title"
      type: "text"
      onblur: "submit"
      title: "Short page title"
      emptytext: "catchy short page title here"
      success: (response, newValue) ->
        updateProduct pageTitle: newValue

    # *****************************************************
    # Editable vendor entry - dropdown
    # *****************************************************
    $("#vendor").editable
      type: "text"
      inputclass: "vendor"
      onblur: 'submit'
      title: "Vendor, Brand, Manufacturer"
      emptytext: "vendor, brand, manufacturer"
      success: (response, newValue) ->
        updateProduct vendor: newValue

    # *****************************************************
    # Editable price - really first variant entry
    # *****************************************************
    $("#price").editable
      type: "text"
      emptytext: "0.00"
      inputclass: "price"
      title: "Default variant price"
      success: (response, newValue) ->
        updateProduct({"variants.0.price": newValue})


    # *****************************************************
    # Editable product html
    # *****************************************************
    #
    $("#description").editable
      type: "textarea"
      inputclass: "description"
      onblur: 'submit'
      title: "Describe this product"
      emptytext: "add a few lines describing this product"
      success: (response, newValue) ->
        updateProduct description: newValue


    # *****************************************************
    # Editable social handle (hashtag, url)
    # *****************************************************
    #
    $("#handle").editable
      type: "text"
      inputclass: "handle"
      onblur: 'submit'
      emptytext: "add-short-social-hashtag"
      title: "Social handle for sharing and navigation"
      success: (response, newValue) ->
        updateProduct handle: newValue


    # *****************************************************
    # Editable twitter, social messages entry
    # *****************************************************
    $(".twitter-msg").editable
      selector: '.twitter-msg-edit'
      inputclass: "xeditable-input"
      type: "textarea"
      mode: "popup"
      onblur: 'submit'
      emptytext: '<i class="fa fa-twitter fa-lg"></i>'
      title: "Default Twitter message ~100 characters!"
      success: (response, newValue) ->
        updateProduct twitterMsg: newValue

    $(".pinterest-msg").editable
      selector: '.pinterest-msg-edit'
      inputclass: "xeditable-input"
      type: "textarea"
      mode: "popup"
      onblur: 'submit'
      emptytext: '<i class="fa fa-pinterest fa-lg"></i>'
      title: "Default Pinterest message ~200 characters!"
      success: (response, newValue) ->
        updateProduct pinterestMsg: newValue

    $(".facebook-msg").editable
      selector: '.facebook-msg-edit'
      inputclass: "xeditable-input"
      type: "textarea"
      mode: "popup"
      onblur: 'submit'
      emptytext: '<i class="fa fa-facebook fa-lg"></i>'
      title: "Default Facebook message ~200 characters!"
      success: (response, newValue) ->
        updateProduct facebookMsg: newValue

    $(".instagram-msg").editable
      selector: '.instagram-msg-edit'
      inputclass: "xeditable-input"
      type: "textarea"
      mode: "popup"
      onblur: 'submit'
      emptytext: '<i class="fa fa-instagram fa-lg"></i>'
      title: "Default Instagram message ~100 characters!"
      success: (response, newValue) ->
        updateProduct instagramMsg: newValue
    # *****************************************************
    # Editable tag field
    # *****************************************************
    data = []
    Tags.find().forEach (tag) ->
      data.push(
        id: tag.name
        text: tag.name
      )
    $("#tags").editable
      onblur: 'submit'
      inputclass: "tags"
      title: "Add tags to categorize"
      emptytext: "add tags to categorize"
      select2:
        tags: data
        tokenSeparators: [
          ","
          " "
        ]

      success: (response, names) ->
        tagIds = []
        for name in names
          slug = _.slugify(name)
          existingTag = Tags.findOne({slug: slug})
          if existingTag
            tagIds.push(existingTag._id)
          else
            _id = Tags.insert(
              name: name
              slug: slug
              shopId: Meteor.app.shopId
              isTopLevel: false
              updatedAt: new Date()
              createdAt: new Date()
            )
            tagIds.push(_id)
        updateProduct(
          tagIds: tagIds
        )

    # *****************************************************
    # Function to update product
    # param: property:value
    # returns true or err
    # *****************************************************
    updateProduct = (productsProperties) ->
      currentProductId = Session.get("currentProductId")
      Products.update currentProductId,
        $set: productsProperties
      , (error) ->
        if error
          throwError error
          false
        else
          true

# **********************************************************************************************************
# events for main product detail page
#
# **********************************************************************************************************

Template.productDetail.events
  "click #add-to-cart": (e, template) ->
    e.preventDefault()
    now = new Date()
    return throwError("Oops, select an option before adding to cart") unless Session.get("selectedVariant")
    sessionId = Session.get("serverSession")._id
    variantData = Session.get("selectedVariant")
    productId = Session.get("currentProductId")
    quantity = 1

    Meteor.call "addToCart", Session.get('shoppingCart')._id, productId, variantData, quantity
    $('.variant-list #'+Session.get("selectedVariant")._id).removeClass("variant-detail-selected") if Session.get("selectedVariant")
    Session.set("selectedVariant","")
    $("html, body").animate({ scrollTop: 0 }, "fast")
    $("#shop-cart-slide").fadeIn(400 ).delay( 10000 ).fadeOut( 500 )


  "submit form": (e) ->
    e.preventDefault()
    currentProductId = Session.get("currentProductId")
    productsProperties =
      title: $(e.target).find("[name=title]").val()
      vendor: $(e.target).find("[name=vendor]").val()
      description: $(e.target).find("[name=description]").val()
      tags: $(e.target).find("[name=tags]").val()
      handle: $(e.target).find("[name=handle]").val()

    Products.update currentProductId,
      $set: productsProperties
    , (error) ->
      if error
        # display the error to the user
        alert error.reason

  # *****************************************************
  # deletes entire product
  # TODO: implement revision control by using
  # suspended = boolean // not visible on site
  # archived = boolean // not visible in admin
  # this function is a full delete
  # TODO: delete from archived list
  # *****************************************************
  "click .delete": (e) ->
    e.preventDefault()
    if confirm("Delete this product?")
      currentProductId = Session.get("currentProductId")
      Products.remove currentProductId
      Router.go "/shop/products"

  "click #edit-options": (e) ->
    $("#options-modal").modal()
    e.preventDefault()
  "click .toggle-product-isVisible-link": (e, t) ->
    Products.update(t.data._id, {$set: {isVisible: !t.data.isVisible}})

# *****************************************************
# helper methods for productDetail
# *****************************************************
Template.productDetail.helpers
  actualPrice: () ->
     this.variants[getSelectedVariantIndex()].price if this.variants[getSelectedVariantIndex()]