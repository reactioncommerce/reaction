Template.productMetaFieldForm.events
  'click .metafield-remove': (event,template) ->
    productId = selectedProductId()
    Products.update(productId, {$pull:{ metafields: @ }})

Template.metaComponent.events
  'change input': (event,template) ->
    updateMeta =
      key: $(event.currentTarget).parent().children('.metafield-key-input').val()
      value: $(event.currentTarget).parent().children('.metafield-value-input').val()
    if @.key
      productId = selectedProductId()
      Meteor.call "updateMetaFields", productId, updateMeta, @
      $(event.currentTarget).animate({backgroundColor: "#e2f2e2" }).animate({backgroundColor: "#fff"})
      Tracker.flush()
    else
      if (updateMeta.key and updateMeta.value) or updateMeta.value
        Meteor.call "updateMetaFields", @._id, updateMeta
        Tracker.flush()
        $(event.currentTarget).parent().children('.metafield-key-input').val('').focus()
        $(event.currentTarget).parent().children('.metafield-value-input').val('')
      else
        return
