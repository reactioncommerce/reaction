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
    product = currentProduct.get "product"
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

  metaComponent: () ->
    if Meteor.app.hasOwnerAccess()
      return Template.productMetaFieldForm
    else
      return Template.productMetaField


Template.productDetail.events
  "click #price": ->
    if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
      if currentProduct.get("variant").parentId
        toggleSession  "variant-form-" + currentProduct.get("variant").parentId
      else
        toggleSession  "variant-form-" + currentProduct.get("variant")._id

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
          Alerts.add "Please choose options before adding to cart", "danger", placement:"productDetail"
          return

      # If variant has inv policy and is out of stock, show warning and deny add to cart
      if (currentVariant.inventoryPolicy and currentVariant.inventoryQuantity < 1)
        Alerts.add "Sorry, this item is out of stock!", "danger", placement:"productDetail"
        return

      cartSession =
        sessionId: Session.get "sessionId"
        userId: Meteor.userId()

      # Get desired variant qty from form
      quantity = $(event.target).parent().parent().find('input[name="addToCartQty"]').val()
      if quantity < 1
          quantity = 1

      unless @.isVisible
        Alerts.add "Publish product before adding to cart.", "danger", placement:"productDetail"
        return
      else
        CartWorkflow.addToCart cartSession, currentProduct._id, currentVariant, quantity
        $('.variant-list-item #'+currentVariant._id).removeClass("variant-detail-selected")
        $(event.target).parent().parent().find('input[name="addToCartQty"]').val(1)
        $('html,body').animate({scrollTop:0},0)
        $('.cart-alert-text').text(quantity + " " + currentVariant.title + " added")
        $('.cart-alert').toggle('slide',{direction:'right', 'width': currentVariant.title.length+50 + "px"},800).delay(2000).fadeOut(800)

    else
      Alerts.add "Select an option before adding to cart", "danger", placement:"productDetail"
      return

  "click .toggle-product-isVisible-link": (event, template) ->
    errorMsg = ""
    unless @.title
        errorMsg = "Product title is required before publishing. "
    for variant,index in @.variants
      unless variant.title
        errorMsg += "Variant " + index + " label is required. "
      unless variant.price
        errorMsg += "Variant " + index + " price is required. "

    if errorMsg
      Alerts.add errorMsg, "danger", placement:"productDetail"
      return
    else
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

