Template.productDetailEdit.helpers
  i18nPlaceholder: () ->
    i18nextDep.depend()
    i18n_key = "productDetailEdit." + @field
    if i18n.t(i18n_key) is i18n_key
      console.info "returning empty placeholder,'productDetailEdit:" + i18n_key + "' no i18n key found."
      return
    else
      return i18n.t(i18n_key)

Template.productDetailEdit.events
  "change input,textarea": (event,template) ->
    Meteor.call "updateProductField", selectedProductId(), this.field, $(event.currentTarget).val(), (error,results) ->
      if results
        $(event.currentTarget).animate({backgroundColor: "#e2f2e2" }).animate({backgroundColor: "#fff"})
    if this.type is "textarea" then autosize($(event.currentTarget))
    Session.set "editing-"+this.field, false


Template.productDetailField.events
  "click .product-detail-field": (event,template) ->
    if ReactionCore.hasOwnerAccess()
      fieldClass = "editing-" + this.field
      Session.set fieldClass, true
      Tracker.flush()
      $('.' + this.field + '-edit-input').focus()

Template.productDetailEdit.rendered = () ->
  autosize($('textarea'))
