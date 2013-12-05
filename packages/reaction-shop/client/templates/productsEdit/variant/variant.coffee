Template.variant.events =
  
  #  'change input[name="variant"]': function (e, template) {
  #    if (e.target.checked) {
  #
  #    }
  #    return true;
  #  },
  "click .remove-link": (e, template) ->
    if confirm($(e.target).closest("a").data("confirm"))
      Products.update Session.get("currentProductId"),
        $pull:
          variants: template.data

    e.preventDefault()
    e.stopPropagation()

  "click .edit-link": (e, template) ->
    
    #    $('#variants-modal form').get(0).reset();
    Session.set "currentVariantIndex", $(e.target).closest("tr").prevAll().length
    $("#variants-modal").modal()
    e.preventDefault()
    e.stopPropagation()

  "click .buy": (e, template) ->
    now = new Date()
    sessionId = Session.get("serverSession")._id
    variantData = template.data
    productId = Session.get("currentProductId")
    quantity = 1
    
    # Check for, create cart
    Meteor.call "createCart", sessionId, productId, variantData, (err, cart) ->
      # Insert new item, update quantity for existing
      currentCart = Cart.findOne()  unless err
      Meteor.call "addToCart", currentCart._id, productId, variantData, quantity

    e.preventDefault()
