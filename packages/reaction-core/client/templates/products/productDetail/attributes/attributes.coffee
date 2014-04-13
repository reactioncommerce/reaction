Template.productMetaFieldForm.events
  'click .metafield-remove': (event,template) ->
    product = currentProduct.get "product"
    Products.update(product._id, {$pull:{ metafields: @ }})

Template.metaComponent.events
  'change input': (event,template) ->
    updateMeta =
      key: $(event.currentTarget).parent().children('.metafield-key-input').val()
      value: $(event.currentTarget).parent().children('.metafield-value-input').val()
    if @.key
      product = currentProduct.get "product"
      Meteor.call "updateMetaFields", product._id, updateMeta, @
      $(event.currentTarget).animate({backgroundColor: "#e2f2e2" }).animate({backgroundColor: "#fff"})
      Deps.flush()
    else
      if (updateMeta.key and updateMeta.value) or updateMeta.value
        Meteor.call "updateMetaFields", @._id, updateMeta
        Deps.flush()
        $(event.currentTarget).parent().children('.metafield-key-input').val('').focus()
        $(event.currentTarget).parent().children('.metafield-value-input').val('')
      else
        return
