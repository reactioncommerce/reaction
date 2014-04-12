Template.metaComponent.events
  'change input': (event,template) ->
    updateMeta =
      key: $(event.currentTarget).parent().children('#metafield-key').val()
      value: $(event.currentTarget).parent().children('#metafield-value').val()
    if @.key
      product = currentProduct.get "product"
      Meteor.call "updateMetaFields", product._id, updateMeta, @
      $(event.currentTarget).animate({backgroundColor: "#e2f2e2" }).animate({backgroundColor: "#fff"})
      Deps.flush()
    else
      $(event.currentTarget).parent().children('#metafield-value').val('')
      $(event.currentTarget).parent().children('#metafield-key').val('')
      Meteor.call "updateMetaFields", @._id, updateMeta
      Deps.flush()