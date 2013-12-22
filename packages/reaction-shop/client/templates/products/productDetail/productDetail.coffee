Template.productsEdit.helpers
  tags: ->
    currentProductId = Session.get("currentProductId")
    product = Products.findOne(currentProductId)
    if product.tagIds
      Tags.find({_id: {$in: product.tagIds}}).fetch()
    else
      []
  stringify: (tags) ->
    _.pluck(tags, "name").join(", ")

Template.productsEdit.rendered = ->

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
  if Roles.userIsInRole(Meteor.user(), "admin")
    $.fn.editable.defaults.mode = "popup"
    $.fn.editable.defaults.showbuttons = false

    # *****************************************************
    # TODO: Tabbing
    # SEE: https://github.com/vitalets/x-editable/issues/324
    # *****************************************************

    # *****************************************************
    # Editable product title entry
    # *****************************************************
    $("#title").editable
      inputclass: "editable-width"
      success: (response, newValue) ->
        updateProduct title: newValue

      validate: (value) ->
        if $.trim(value) is ""
          throwError "This field is required"
          false


    # *****************************************************
    # Editable vendor entry - dropdown
    # *****************************************************
    $("#vendor").editable
      inputclass: "editable-width"
      success: (response, newValue) ->
        updateProduct vendor: newValue


    # *****************************************************
    # Editable price - really first variant entry
    # *****************************************************
    $("#price").editable success: (response, newValue) ->
      updateProduct({"variants.0.price": newValue})


    # *****************************************************
    # Editable product html
    # *****************************************************
    #
    $("#bodyHtml").editable
      showbuttons: true
      inputclass: "editable-width"
      success: (response, newValue) ->
        updateProduct bodyHtml: newValue


    # *****************************************************
    # Editable social handle (hashtag, url)
    # *****************************************************
    #
    $("#handle").editable
      inputclass: "editable-width"
      success: (response, newValue) ->
        updateProduct handle: newValue


    # *****************************************************
    # Editable twitter, social messages entry
    # *****************************************************
    $("#twitter-msg").editable
      inputclass: "editable-width"
      value: "tweet this!"
      type: "text"
      title: "Default Twitter message ~100 characters!"
      success: (response, newValue) ->
        updateProduct twitter_msg: newValue


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
      showbuttons: true
      inputclass: "editable-width"
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
    # Editable variants entry
    # Format
    #    :description => 'Author of book',
    #    :namespace => 'book',
    #    :key => 'author',
    #    :value => 'Kurt Vonnegut',
    #    :value_type => 'string'
    # *****************************************************
    $("#variants").editable
      inputclass: "input-large"
      select2:
        width: "250px"
        initSelection: (element, callback) ->
          data = []
          data =
            id: "1"
            text: "text"

          callback data

        data: (element, callback) ->
          data = []
          data =
            id: "2"
            text: "text2"

          callback data

      success: (response, newValue) ->
        updateProduct variants: newValue


    # *****************************************************
    # Function to return variant data
    # param: property:value
    # returns true or err
    # *****************************************************
    variants = (options) ->
      currentProductId = Session.get("currentProductId")
      product = Products.findOne(
        _id: currentProductId
      ,
        fields:
          variants: true
      ).variants.valueOf()
      variant = []
      i = 0

      while i < product.length
        variant[i] =
          value: i
          text: product[i].sku
        i++
      variant


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


    # $(".variant-table input[name=\"variant\"]").get(getSelectedVariantIndex()).checked = true


# **********************************************************************************************************
# events for main product detail page
#
# **********************************************************************************************************

Template.productsEdit.events
  "click #add-to-cart": (e, template) ->
    e.preventDefault()
    now = new Date()
    return throwError("Oops,select an option before adding to cart") unless Session.get("selectedVariant")
    sessionId = Session.get("serverSession")._id
    variantData = Session.get("selectedVariant")
    productId = Session.get("currentProductId")
    quantity = 1

    Meteor.call "addToCart", Session.get('shoppingCart')._id, productId, variantData, quantity
    $('.variant-list #'+Session.get("selectedVariant")._id).removeClass("variant-detail-selected") if Session.get("selectedVariant")
    Session.set("selectedVariant","")
    $("#shop-cart-slide").fadeIn(400 ).delay( 5000 ).fadeOut( 300 )


  "submit form": (e) ->
    e.preventDefault()
    currentProductId = Session.get("currentProductId")
    productsProperties =
      title: $(e.target).find("[name=title]").val()
      vendor: $(e.target).find("[name=vendor]").val()
      bodyHtml: $(e.target).find("[name=bodyHtml]").val()
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
    if confirm("Delete this products?")
      currentProductId = Session.get("currentProductId")
      Products.remove currentProductId
      Router.go "/shop/products"

  "click .variant-list": (e) ->
    $('.variant-list #'+Session.get("selectedVariant")._id).removeClass("variant-detail-selected") if Session.get("selectedVariant")
    Session.set("selectedVariant",this)#for cart
    Session.set "selectedVariantIndex", $(e.target).closest("li").prevAll().length
    $('.variant-list #'+this._id).addClass("variant-detail-selected")
    e.stopPropagation()

  "click #add-variant": (e) ->
    currentProduct = Products.findOne(Session.get("currentProductId"))
    lastVariant = _.last(currentProduct.variants)
    delete lastVariant._id
    delete lastVariant.updatedAt
    delete lastVariant.createdAt
    clonedLastVariant = _.clone(lastVariant)
    newVariantIndex = currentProduct.variants.length
    Products.update(currentProduct._id, {$push: {variants: clonedLastVariant}})
    Session.set "currentVariantIndex", newVariantIndex
    $("#variants-modal").modal()
    e.preventDefault()

  "click #edit-options": (e) ->
    $("#options-modal").modal()
    e.preventDefault()
  "click .toggle-product-isVisible-link": (e, t) ->
    Products.update(t.data._id, {$set: {isVisible: !t.data.isVisible}})

window.getSelectedVariantIndex = ->
  Session.get("selectedVariantIndex") or 0

window.getSelectedVariant = ->
  product = Products.findOne(Session.get("currentProductId"))
  product.variants[getSelectedVariantIndex()]
