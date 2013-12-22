Template.variant.events =
  "click .remove-link": (e, template) ->
    if confirm($(e.target).closest("a").data("confirm"))
      Products.update Session.get("currentProductId"),
        $pull:
          variants: template.data
    e.preventDefault()
    e.stopPropagation()

  "click .edit-link": (e, template) ->
    Session.set "currentVariantIndex", $(e.target).closest("li").prevAll().length
    $("#variants-modal").modal()
    e.preventDefault()
    e.stopPropagation()

Template.variant.helpers
  maxQty: () ->
    qty = 0
    variants = Products.findOne(Session.get("currentProductId"),{fields:{variants:true}}).variants
    _.map variants, (value,key) ->
      qty += variants[key].inventoryQuantity
    qty
  maxLength: (qty,max) ->
    length = (qty / max) * 100
    length = 75 if (length > 75)
    length
