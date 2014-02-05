# *****************************************************
# helper methods for productDetail
# *****************************************************
Template.productDetail.helpers
  tags: ->
    product = (currentProduct.get "product")
    if product.tagIds
      Tags.find({_id: {$in: product.tagIds}}).fetch()
    else
      []
  stringify: (tags) ->
    _.pluck(tags, "name").join(", ")

  actualPrice: () ->
    (currentProduct.get "variant")?.price



Template.productDetail.rendered = ->
  # *****************************************************
  # Inline field editing, handling
  # http://vitalets.github.io/x-editable/docs.html
  #
  # $.fn.editable.defaults.disabled = true
  # *****************************************************
  if Meteor.app.hasOwnerAccess()
    $.fn.editable.defaults.disabled = false
    $.fn.editable.defaults.mode = "inline"
    $.fn.editable.defaults.showbuttons = false
    $.fn.editable.defaults.onblur = 'submit'
    $.fn.editable.defaults.highlight = '#eff6db'

    # *****************************************************
    # Editable product title entry
    # *****************************************************

    $("#title").editable
      type: "text"
      title: "Product name"
      clear: true
      emptytext: "product name goes here"
      inputclass: "pdp-title"
      success: (response, newValue) ->
        updateProduct title: newValue

      validate: (value) ->
        if $.trim(value) is ""
          throwAlert "A product name is required"
          false
    # *****************************************************
    # Editable page title entry
    # *****************************************************
    $("#pageTitle").editable
      inputclass: "pdp-page-title"
      type: "text"
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
      escape: false
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
      emptytext: "add-short-social-hashtag"
      title: "Social handle for sharing and navigation"
      success: (response, newValue) ->
        updateProduct handle: newValue


    # *****************************************************
    # Editable twitter, social messages entry
    # *****************************************************
    $(".twitter-msg").editable
      selector: '.twitter-msg-edit'
      type: "textarea"
      mode: "popup"
      emptytext: '<i class="fa fa-twitter fa-lg"></i>'
      title: "Default Twitter message ~100 characters!"
      success: (response, newValue) ->
        updateProduct twitterMsg: newValue

    $(".pinterest-msg").editable
      selector: '.pinterest-msg-edit'
      type: "textarea"
      mode: "popup"
      emptytext: '<i class="fa fa-pinterest fa-lg"></i>'
      title: "Default Pinterest message ~200 characters!"
      success: (response, newValue) ->
        updateProduct pinterestMsg: newValue

    $(".facebook-msg").editable
      selector: '.facebook-msg-edit'
      type: "textarea"
      mode: "popup"
      emptytext: '<i class="fa fa-facebook fa-lg"></i>'
      title: "Default Facebook message ~200 characters!"
      success: (response, newValue) ->
        updateProduct facebookMsg: newValue

    $(".instagram-msg").editable
      selector: '.instagram-msg-edit'
      type: "textarea"
      mode: "popup"
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
      Products.update (currentProduct.get "product")._id,
        $set: productsProperties
      , (error) ->
        if error
          throwAlert error
          false
        else
          true

# **********************************************************************************************************
# events for main product detail page
#
# **********************************************************************************************************

Template.productDetail.events
  # *****************************************************
  # TODO: Tabbing
  # SEE: https://github.com/vitalets/x-editable/issues/324
  # *****************************************************
  # "keydown input": (e) ->
  #   if e.which is 9 # when tab key is pressed
  #     e.preventDefault()
  #     if e.shiftKey # shift + tab
  #       # find the parent of the editable before this one in the markup
  #       $(event.target).blur().parents().prevAll(":has(.editable):first").find(".editable:last").editable "show"
  #     else # just tab
  #       # find the parent of the editable after this one in the markup
  #       $(event.target).blur().parents().nextAll(":has(.editable):first").find(".editable:first").editable "show"

  "click #add-to-cart": (event, template) ->
    event.preventDefault()
    event.stopPropagation()
    now = new Date()
    if (currentProduct.get "variant")
        cartSession =
          sessionId: Session.get "sessionId"
          userId: Meteor.userId()
        quantity = 1
        Meteor.call "addToCart", cartSession, (currentProduct.get "product")._id, (currentProduct.get "variant"), quantity
        $('.variant-list-item #'+(currentProduct.get "variant")._id).removeClass("variant-detail-selected")
        setTimeout (->
          toggleCartDrawer()
        ), 500
    else
      throwAlert("Select an option before adding to cart")

  "submit form": (event) ->
    event.preventDefault()
    event.stopPropagation()
    productsProperties =
      title: $(event.target).find("[name=title]").val()
      vendor: $(event.target).find("[name=vendor]").val()
      description: $(event.target).find("[name=description]").val()
      tags: $(event.target).find("[name=tags]").val()
      handle: $(event.target).find("[name=handle]").val()

    Products.update (currentProduct.get "product")._id,
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
  "click .delete": (event) ->
    event.preventDefault()
    if confirm("Delete this product?")
      Products.remove (currentProduct.get "product")._id
      Router.go "/"

  "click #edit-options": (event) ->
    $("#options-modal").modal()
    event.preventDefault()

  "click .toggle-product-isVisible-link": (event, template) ->
    Products.update(template.data._id, {$set: {isVisible: !template.data.isVisible}})
