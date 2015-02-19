Template.productDetail.helpers
  tags: ->
    return _.map selectedProduct()?.hashtags, (id) ->
      return Tags.findOne id

  tagsComponent: ->
    if ReactionCore.hasOwnerAccess()
      return Template.productTagInputForm
    else
      return Template.productDetailTags

  actualPrice: () ->
    current = selectedVariant()
    # determine if selected variant is purchasable
    product = selectedProduct()
    if product and current
      childVariants = (variant for variant in product.variants when variant?.parentId is current._id)
      purchasable = if childVariants.length > 0 then false else true
    # if a purchasable variant or option is selected, show its price
    if purchasable
      return current.price
    # otherwise show price range of full variant set
    else
      return getProductPriceRange()

  fieldComponent: (field) ->
    if ReactionCore.hasOwnerAccess()
      return Template.productDetailEdit
    else
      return Template.productDetailField

  metaComponent: () ->
    if ReactionCore.hasOwnerAccess()
      return Template.productMetaFieldForm
    else
      return Template.productMetaField


Template.productDetail.events
  "click #price": ->
    # When an admin clicks on the main price to edit it, instead
    # open the relevant variant edit form and focus the correct input
    if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
      v = selectedVariant()
      return unless v
      if v.parentId
        formName = v.parentId
      else
        formName = v._id
      formName = "variant-form-" + formName
      Session.set formName, true
      $('#' + formName + ' [name=price]').focus()
    return

  "click #add-to-cart-quantity": (event,template) ->
    # Ensure that changing the quantity does not cause a button click
    event.preventDefault()
    event.stopPropagation()

  "change #add-to-cart-quantity": (event,template) ->
    # Ensure that changing the quantity does not cause a button click
    event.preventDefault()
    event.stopPropagation()
    # If we've increased the qty above the available and we have inventory
    # limits in place, reset the qty to the max available.
    currentVariant = selectedVariant()
    if (currentVariant)
      qtyField = template.$('input[name="addToCartQty"]')
      quantity = qtyField.val()
      quantity = 1 if quantity < 1
      # TODO: Should check the amount in the cart as well and deduct from available.
      # TODO: Should also adjust the quantity field whenever the selectedVariant changes for any reason
      if currentVariant.inventoryPolicy and quantity > currentVariant.inventoryQuantity
        qtyField.val(currentVariant.inventoryQuantity)
    return

  "click #add-to-cart": (event,template) ->
    now = new Date()
    currentVariant = selectedVariant()
    currentProduct = selectedProduct()

    if (currentVariant)
      # if variant has children user must choose a childVariant(option)
      unless currentVariant.parentId?
        options = (variant for variant in currentProduct.variants when variant.parentId is currentVariant._id)
        if options.length > 0
          Alerts.add "Please choose options before adding to cart", "danger", placement:"productDetail", i18n_key:"productDetail.chooseOptions", autoHide: 10000
          return

      # If variant has inv policy and is out of stock, show warning and deny add to cart
      if (currentVariant.inventoryPolicy and currentVariant.inventoryQuantity < 1)
        Alerts.add "Sorry, this item is out of stock!", "danger", placement: "productDetail", i18n_key: "productDetail.outOfStock", autoHide: 10000
        return

      cartSession =
        sessionId: Session.get "sessionId"
        userId: Meteor.userId()

      # Get a reference to the quantity field
      qtyField = template.$('input[name="addToCartQty"]')

      # Get desired variant qty from form
      quantity = qtyField.val()
      quantity = 1 if quantity < 1

      unless @.isVisible
        Alerts.add "Publish product before adding to cart.", "danger", placement:"productDetail", i18n_key: "productDetail.publishFirst", autoHide: 10000
        return
      else
        # Add to cart
        CartWorkflow.addToCart cartSession, currentProduct._id, currentVariant, quantity
        # Deselect the current variant
        # todo: make this variant reset an option
        template.$(".variant-select-option").removeClass("active")
        setCurrentVariant null

        # Reset quantity field to 1
        qtyField.val(1)

        # Scroll to top
        $('html,body').animate({scrollTop:0},0)

        # Slide out the cart tip explaining that we added to the cart
        $('.cart-alert-text').text(quantity + " " + currentVariant.title + " " + i18n.t('productDetail.addedToCart') )
        $('.cart-alert').toggle('slide',{
          direction: if i18n.t('languageDirection') == 'rtl' then 'left' else 'right',
          'width': currentVariant.title.length+50 + "px"
        },600).delay(8000).toggle('slide',{
          direction: if i18n.t('languageDirection') == 'rtl' then 'left' else 'right'
        })

    else
      Alerts.add "Select an option before adding to cart", "danger", placement:"productDetail", i18n_key: "productDetail.selectOption", autoHide: 8000
      return

  "click .toggle-product-isVisible-link": (event, template) ->
    errorMsg = ""
    unless @.title
        errorMsg += "Product title is required. "
    for variant,index in @.variants
      unless variant.title
        errorMsg += "Variant " + (index + 1) + " label is required. "
      unless variant.price
        errorMsg += "Variant " + (index + 1) + " price is required. "

    if errorMsg.length
      Alerts.add errorMsg, "danger", placement:"productDetail"
    else
      Products.update(template.data._id, {$set: {isVisible: !template.data.isVisible}})
    return

  "click .delete-product-link": (event, template) ->
    maybeDeleteProduct @
    return

  "click .fa-facebook": ->
    if ReactionCore.hasOwnerAccess()
      $(".facebookMsg-edit").fadeIn()
      $(".facebookMsg-edit-input").focus()

  "click .fa-twitter": ->
    if ReactionCore.hasOwnerAccess()
      $(".twitterMsg-edit").fadeIn()
      $(".twitterMsg-edit-input").focus()

  "click .fa-pinterest": ->
    if ReactionCore.hasOwnerAccess()
      $(".pinterestMsg-edit").fadeIn()
      $(".pinterestMsg-edit-input").focus()

  "click .fa-instagram": ->
    if ReactionCore.hasOwnerAccess()
      $(".instagramMsg-edit").fadeIn()
      $(".instagramMsg-edit-input").focus()

  "focusout .facebookMsg-edit-input,.twitterMsg-edit-input,.pinterestMsg-edit-input": ->
    Session.set "editing-"+this.field, false
    $('.social-media-inputs > *').hide()
