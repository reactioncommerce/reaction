Template.variant.events =
  "click .remove-link": (e, template) ->
    if confirm($(e.target).closest("a").data("confirm"))
      Products.update Session.get("currentProductId"),
        $pull:
          variants: template.data
    e.preventDefault()
    e.stopPropagation()

  "click .edit-link": (e) ->
    $("#variants-modal").modal()

  "dblclick .variant-list": (e) ->
    $("#variants-modal").modal()

  "click .variant-list > *": (e) ->
    $('.variant-list #'+Session.get("selectedVariant")._id).removeClass("variant-detail-selected") if Session.get("selectedVariant")
    Session.set("selectedVariant",this)#for cart

    index = $(e.target).closest("li").prevAll().length
    Session.set "selectedVariantIndex", (index - 1)

    $('.variant-list #'+this._id).addClass("variant-detail-selected")
    e.stopPropagation()

Template.variant.helpers
  maxQty: () ->
    qty = 0
    variants = Products.findOne(Session.get("currentProductId"),{fields:{variants:true}}).variants
    _.map variants, (value,key) ->
      qty += variants[key].inventoryQuantity
    qty
  maxLength: (max) ->
    inventoryPercentage = (this.inventoryQuantity / max) * 100
    inventoryPercentage  = (100 - (this.title.length * 2)) if (inventoryPercentage  + this.title.length > 100)
    inventoryPercentage