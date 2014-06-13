Template.productDetailEdit.events
  "change input,textarea": (event,template) ->
    Meteor.call "updateProductField", (currentProduct.get "product")._id,  this.field, $(event.currentTarget).val(), (error,results) ->
      if results
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
