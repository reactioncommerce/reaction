Template.productDetail.helpers
  quantityFormSchema: ->
    QuantitySchema = new SimpleSchema
      addToCartQty:
        label: "Quantity:"
        type: Number
        min: 1
        max: 99
    qtySchema = new AutoForm QuantitySchema
    qtySchema

  tags: ->
    product = (currentProduct.get "product")
    if product?.tagIds
      Tags.find({_id: {$in: product.tagIds}}).fetch()
    else
      []

  tagsComponent: ->
    if Meteor.app.hasOwnerAccess()
      return Template.productTagInputForm
    else
      return null

  actualPrice: () ->
    (currentProduct.get "variant")?.price

  fieldComponent: (field) ->
    if Meteor.app.hasOwnerAccess()
      return Template.productDetailEdit
    else
      return Template.productDetailField


Template.productDetail.events
  "click #price": ->
    id = currentProduct.get("variant")._id
    $('#variant-edit-form-'+id).fadeIn()

  "click #add-to-cart-quantity": (event,template) ->
    event.preventDefault()
    event.stopPropagation()

  "change #add-to-cart-quantity": (event,template) ->
    event.preventDefault()
    event.stopPropagation()
    if (currentProduct.get "variant")
      variant = currentProduct.get "variant"
      quantity = $(event.target).parent().parent().find('input[name="addToCartQty"]').val()
      if quantity < 1
          quantity = 1
      # TODO: Should check the amount in the cart as well and deduct from available.
      if variant.inventoryPolicy and quantity > variant.inventoryQuantity
        $(event.target).parent().parent().find('input[name="addToCartQty"]').val(variant.inventoryQuantity)
        return

  "click #add-to-cart": (event,template) ->
    # event.preventDefault()
    # event.stopPropagation()
    now = new Date()
    # questionable scope issue, pull from global scope
    currentVariant = window.currentProduct.get "variant"
    currentProduct  = window.currentProduct.get "product"

    if (currentVariant)
      # if variant has children user must choose a childVariant(option)
      unless currentVariant.parentId?
        options = (variant for variant in currentProduct.variants when variant.parentId is currentVariant._id)
        if options.length > 0
          Alerts.add "Please choose options before adding to cart"
          return

      # If variant has inv policy and is out of stock, show warning and deny add to cart
      if (currentVariant.inventoryPolicy and currentVariant.inventoryQuantity < 1)
        Alerts.add "Sorry, this item is out of stock!"
        return

      cartSession =
        sessionId: Session.get "sessionId"
        userId: Meteor.userId()

      # Get desired variant qty from form
      quantity = $(event.target).parent().parent().find('input[name="addToCartQty"]').val()
      if quantity < 1
          quantity = 1

      CartWorkflow.addToCart cartSession, currentProduct._id, currentVariant, quantity
      $('.variant-list-item #'+currentVariant._id).removeClass("variant-detail-selected")
      $(event.target).parent().parent().find('input[name="addToCartQty"]').val(1)
      unless Session.get "displayCart" then toggleSession "displayCart"

    else
      Alerts.add "Select an option before adding to cart"

  "click .toggle-product-isVisible-link": (event, template) ->
    Products.update(template.data._id, {$set: {isVisible: !template.data.isVisible}})

  "click .fa-facebook": ->
    if Meteor.app.hasOwnerAccess()
      $(".facebookMsg-edit").fadeIn()
      $(".facebookMsg-edit-input").focus()

  "click .fa-twitter": ->
    if Meteor.app.hasOwnerAccess()
      $(".twitterMsg-edit").fadeIn()
      $(".twitterMsg-edit-input").focus()

  "click .fa-pinterest": ->
    if Meteor.app.hasOwnerAccess()
      $(".pinterestMsg-edit").fadeIn()
      $(".pinterestMsg-edit-input").focus()

  "click .fa-instagram": ->
    if Meteor.app.hasOwnerAccess()
      $(".instagramMsg-edit").fadeIn()
      $(".instagramMsg-edit-input").focus()

  "focusout .facebookMsg-edit-input,.twitterMsg-edit-input,.pinterestMsg-edit-input": ->
    Session.set "editing-"+this.field, false
    $('.social-media-inputs > *').hide()

Template.productDetail.rendered = ->
  if Meteor.app.hasOwnerAccess()
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
          Alerts.add error.message
          false
        else
          true


Template.productDetailEdit.events
  "change input,textarea": (event,template) ->
    Meteor.call "updateProductField", (currentProduct.get "product")._id,  this.field, $(event.currentTarget).val(), (error,results) ->
      if results
        # $(event.currentTarget) + " .product-detail-message").text("Saved")
        $(event.currentTarget).animate({backgroundColor: "#e2f2e2" }).animate({backgroundColor: "#fff"})
    if this.type is "textarea" then $(event.currentTarget).trigger('autosize.resize')
    Session.set "editing-"+this.field, false


Template.productDetailField.events
  "click .product-detail-field": (event,template) ->
    if Meteor.app.hasOwnerAccess()
      fieldClass = "editing-" + this.field
      Session.set fieldClass, true
      Deps.flush()
      $('.' + this.field + '-edit-input').focus()

Template.productDetailEdit.rendered = () ->
  $('textarea').autosize()

Template.productTagInputForm.events
  'click #btn-tags-cancel, click body': (event,template) ->
    currentTag = Session.get "currentTag"
    Session.set "isEditing-"+currentTag, false

  'click .tag-input-group-remove': (event,template) ->
    currentTag = Session.get "currentTag"
    Meteor.call "removeProductTag", @._id, currentTag

  'click .tags-input-select': (event,template) ->
    $(event.currentTarget).autocomplete(
      delay: 0
      autoFocus: true
      source: (request, response) ->
        datums = []
        slug = _.slugify(request.term)
        Tags.find({slug: new RegExp(slug, "i")}).forEach (tag) ->
          datums.push(
            label: tag.name
          )
        response(datums)
    )
    Deps.flush()

  'change .tags-input-select': (event,template) ->
    currentTag = Session.get "currentTag"
    Meteor.call "updateProductTags", $(event.currentTarget).val(), @._id, currentTag
    $('#tags-submit-new').val('')
    $('#tags-submit-new').focus()
    # Deps.flush()

  'blur.autocomplete': (event,template) ->
    if $(event.currentTarget).val()
      currentTag = Session.get "currentTag"
      Meteor.call "updateProductTags", $(event.currentTarget).val(), @._id, currentTag
      Deps.flush()
      $('#tags-submit-new').val('')
      $('#tags-submit-new').focus()

  'mousedown .tag-input-group-handle': (event,template) ->
    Deps.flush()
    $(".tag-edit-list").sortable("refresh")

Template.productTagInputForm.rendered = ->
  # *****************************************************
  # Inline field editing, handling
  # http://vitalets.github.io/x-editable/docs.html
  # *****************************************************
    $(".tag-edit-list").sortable
      items: "> li"
      axis: "x"
      handle: '.tag-input-group-handle'
      update: (event, ui) ->
        uiPositions = $(@).sortable("toArray", attribute:"data-tag-id")
        for tag,index in uiPositions
          Tags.update(tag, {$set: {position: index}})
