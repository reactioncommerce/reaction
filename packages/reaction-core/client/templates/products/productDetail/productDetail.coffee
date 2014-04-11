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
  stringify: (tags) ->
    _.pluck(tags, "name").join(", ")

  actualPrice: () ->
    (currentProduct.get "variant")?.price

  component: (field) ->
    if Meteor.app.hasOwnerAccess()
      return Template.productDetailEdit
    else
      return Template.productDetailField


Template.productDetail.events
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