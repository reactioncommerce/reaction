Template.variant.events
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
    Session.set "selectedVariantIndex", index

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
    if this.title
      inventoryPercentage = (this.inventoryQuantity / max) * 100
      inventoryPercentage  = (100 - (this.title.length * 2)) if (inventoryPercentage  + this.title.length > 100)
      inventoryPercentage

Template.variantList.events
  "click #add-variant": (e) ->
    currentProduct = Products.findOne(Session.get("currentProductId"))

    #clone last variant
    if _.last(currentProduct.variants)
      lastVariant = _.last(currentProduct.variants)
      delete lastVariant._id
      delete lastVariant.updatedAt
      delete lastVariant.createdAt
      delete lastVariant.inventoryQuantity
      delete lastVariant.title
      clonedLastVariant = _.clone(lastVariant)
    #If no existing variants, add new
    else
      clonedLastVariant =
        _id: Random.id()
        title: "New product variant"
        price: 0

    newVariantIndex = currentProduct.variants.length
    #Products._collection.update(currentProduct._id, {$push: {variants: clonedLastVariant}})
    Meteor.call "cloneVariant", currentProduct._id, clonedLastVariant
    Session.set "selectedVariantIndex", newVariantIndex
    $("#variants-modal").modal()
    e.preventDefault()

Template.variantList.rendered = ->
  # *****************************************************
  # Editable variants entry
  # Format
  #    :description => 'Author of book',
  #    :namespace => 'book',
  #    :key => 'author',
  #    :value => 'Kurt Vonnegut',
  #    :value_type => 'string'
  # *****************************************************
  $("#variants").editable
    inputclass: "input-large"
    select2:
      width: "250px"
      initSelection: (element, callback) ->
        data = []
        data =
          id: "1"
          text: "text"

        callback data

      data: (element, callback) ->
        data = []
        data =
          id: "2"
          text: "text2"

        callback data

    success: (response, newValue) ->
      updateProduct variants: newValue


  # *****************************************************
  # Function to return variant data
  # param: property:value
  # returns true or err
  # *****************************************************
  variants = (options) ->
    currentProductId = Session.get("currentProductId")
    product = Products.findOne(
      _id: currentProductId
    ,
      fields:
        variants: true
    ).variants.valueOf()
    variant = []
    i = 0

    while i < product.length
      variant[i] =
        value: i
        text: product[i].sku
      i++
    variant

# *****************************************************
# methods for variant selection
# *****************************************************
window.getSelectedVariantIndex = ->
  Session.get("selectedVariantIndex") or 0

window.getSelectedVariant = ->
  product = Products.findOne(Session.get("currentProductId"))
  product.variants[getSelectedVariantIndex()]
