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
    tagCollection = []
    if product?.hashtags
      for tagId in product.hashtags
        tagCollection.push Tags.findOne(tagId)
      return tagCollection
    else
      []

  tagsComponent: ->
    if Meteor.app.hasOwnerAccess()
      return Template.productTagInputForm
    else
      return Template.productDetailTags

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
